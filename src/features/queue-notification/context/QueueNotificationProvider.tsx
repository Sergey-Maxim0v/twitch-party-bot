import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'
import type { TwitchNotificationState } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'
import { createInitialNotificationState } from '../utils/createInitialNotificationState.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, LOG_SOURCE } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { formatCurrentQueueStatus } from '../utils/formatCurrentQueueStatus.ts'
import { formatQueueOpenMessage } from '../utils/formatQueueOpenMessage.ts'
import { formatQueueCloseMessage } from '../utils/formatQueueCloseMessage.ts'

export const QueueNotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(createInitialNotificationState())
  const [activeQueueList, setActiveQueueList] = useState<string[]>([])
  const [waitingQueueList, setWaitingQueueList] = useState<string[]>([])

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()
  const { userDisplayName, session } = useAuth()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef<TwitchNotificationState>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const sendAndLogNotification = useCallback((message: string): void => {
    sendChatMessage(message)

    const actorUsername = userDisplayName ?? session?.login ?? 'Application'
    const logText = `Автоматически отправлено сообщение в чат: ${message}`

    pushLog({
      message: logText,
      status: APP_LOG_STATUSES.SUCCESS,
      source: LOG_SOURCE.APPLICATION,
      actorUsername,
    })
  }, [sendChatMessage, pushLog, session?.login, userDisplayName])

  const clearBuffer = useCallback((): void => {
    setState(createInitialNotificationState())
  }, [])

  const sendMessage = useCallback((text: string): void => {
    if (settings.chatNotificationPermissions.allowSending && text.trim().length > 0) {
      sendAndLogNotification(text)
    }
  }, [settings.chatNotificationPermissions.allowSending, sendAndLogNotification])

  const stopNotificationCycle = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const sendMessageOpen = useCallback((): void => {
    if (!settings.chatNotificationPermissions.allowSending || !settings.chatNotificationPermissions.onQueueOpen) {
      return
    }

    const messageText = formatQueueOpenMessage(settings.commands)
    sendAndLogNotification(messageText)
  }, [
    settings.chatNotificationPermissions.allowSending,
    settings.chatNotificationPermissions.onQueueOpen,
    settings.commands,
    sendAndLogNotification,
  ])

  const sendMessageClose = useCallback((): void => {
    if (!settings.chatNotificationPermissions.allowSending || !settings.chatNotificationPermissions.onQueueClose) {
      return
    }

    const queueStatusText = formatCurrentQueueStatus({
      activeUsernames: activeQueueList,
      waitingUsernames: waitingQueueList,
      maxQueueSize: settings.maxQueueSize,
    })

    const messageText = formatQueueCloseMessage(queueStatusText)
    sendAndLogNotification(messageText)
  }, [
    settings.chatNotificationPermissions.allowSending,
    settings.chatNotificationPermissions.onQueueClose,
    settings.maxQueueSize,
    activeQueueList,
    waitingQueueList,
    sendAndLogNotification,
  ])

  const startNotificationCycle = useCallback((): void => {
    stopNotificationCycle()

    const intervalMs = settings.botMessageCooldown * 1000

    timerRef.current = setInterval(() => {
      if (!settings.chatNotificationPermissions.allowSending) {
        return
      }

      const currentNotificationState = stateRef.current
      const messageText = formatNotificationMessage(currentNotificationState)

      if (messageText.length > 0) {
        sendAndLogNotification(messageText)
        setState(createInitialNotificationState())
      }
    }, intervalMs)
  }, [stopNotificationCycle, settings.botMessageCooldown, settings.chatNotificationPermissions.allowSending, sendAndLogNotification])

  const sendCurrentQueueStatus = useCallback((): void => {
    if (!settings.chatNotificationPermissions.allowSending) {
      return
    }

    const statusText = formatCurrentQueueStatus({
      activeUsernames: activeQueueList,
      waitingUsernames: waitingQueueList,
      maxQueueSize: settings.maxQueueSize,
    })

    sendAndLogNotification(statusText)
  }, [settings.chatNotificationPermissions.allowSending, settings.maxQueueSize, activeQueueList, waitingQueueList, sendAndLogNotification])

  // Автоматический перезапуск цикла при изменении интервала cooldown, если он уже был запущен
  useEffect(() => {
    if (timerRef.current) {
      startNotificationCycle()
    }
  }, [settings.botMessageCooldown, startNotificationCycle])

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const addJoinedUser = useCallback((username: string): void => {
    setState(currentState => ({
      ...currentState,
      joined: new Set([...currentState.joined, username]),
    }))
  }, [])

  const addWaitingUser = useCallback((username: string): void => {
    setState(currentState => ({
      ...currentState,
      waiting: new Set([...currentState.waiting, username]),
    }))
  }, [])

  const addDeletedUser = useCallback((username: string): void => {
    setState(currentState => ({
      ...currentState,
      deleted: new Set([...currentState.deleted, username]),
    }))
  }, [])

  const addMovedUser = useCallback((username: string): void => {
    setState(currentState => ({
      ...currentState,
      moved: new Set([...currentState.moved, username]),
    }))
  }, [])

  const addDeniedUser = useCallback((username: string): void => {
    setState(currentState => ({
      ...currentState,
      denied: new Set([...currentState.denied, username]),
    }))
  }, [])

  const contextValue = useMemo<QueueNotificationContextType>(() => ({
    notificationBuffer: state,
    setNotificationBuffer: setState,
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedUser,
    addDeniedUser,
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    clearBuffer,
    startNotificationCycle,
    stopNotificationCycle,
    sendCurrentQueueStatus,
    setActiveQueueList,
    setWaitingQueueList,
  }), [
    state,
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedUser,
    addDeniedUser,
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    clearBuffer,
    startNotificationCycle,
    stopNotificationCycle,
    sendCurrentQueueStatus,
    setActiveQueueList,
    setWaitingQueueList,
  ])

  return (
    <QueueNotificationContext.Provider value={contextValue}>
      {children}
    </QueueNotificationContext.Provider>
  )
}
