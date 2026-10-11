import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'
import type { TwitchNotificationState } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'
import { createInitialNotificationState } from '../utils/createInitialNotificationState.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, LOG_SOURCE } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'

export const QueueNotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(createInitialNotificationState())

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { activeQueue } = useQueue()
  const { pushLog } = useAppLogs()
  const { userDisplayName, session } = useAuth()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stateRef = useRef<TwitchNotificationState>(state)

  const pushLogAboutNotification = useCallback((message: string) => {
    const actorUsername = userDisplayName ?? session?.login ?? 'Application'
    const logText = `Автоматически отправлено сообщение в чат: ${message}`

    pushLog({ message: logText, status: APP_LOG_STATUSES.SUCCESS, source: LOG_SOURCE.APPLICATION, actorUsername })
  }, [pushLog, session?.login, userDisplayName])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const clearBuffer = useCallback((): void => {
    setState(createInitialNotificationState())
  }, [])

  const sendMessage = useCallback((text: string): void => {
    if (settings.chatNotificationPermissions.allowSending && text.trim().length > 0) {
      sendChatMessage(text)
      pushLogAboutNotification(text)
    }
  }, [settings.chatNotificationPermissions.allowSending, sendChatMessage, pushLogAboutNotification])

  const stopNotificationCycle = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startNotificationCycle = useCallback((): void => {
    stopNotificationCycle()

    const intervalMs = settings.botMessageCooldown * 1000

    timerRef.current = setInterval(() => {
      if (!settings.chatNotificationPermissions.allowSending) {
        return
      }

      // Безопасное чтение текущего состояния из ref
      const currentNotificationState = stateRef.current
      const messageText = formatNotificationMessage(currentNotificationState)

      if (messageText.length > 0) {
        sendChatMessage(messageText)
        pushLogAboutNotification(messageText)
        setState(createInitialNotificationState())
      }
    }, intervalMs)
  }, [stopNotificationCycle, settings.botMessageCooldown, settings.chatNotificationPermissions.allowSending, sendChatMessage, pushLogAboutNotification])

  const sendCurrentQueueStatus = useCallback((): void => {
    if (!settings.chatNotificationPermissions.allowSending) {
      return
    }

    if (activeQueue.length === 0) {
      const message = '[Очередь] На данный момент очередь пуста.'
      sendChatMessage(message)
      pushLogAboutNotification(message)
      return
    }

    const playerList = activeQueue.map(player => `@${player.username}`).join(', ')
    const statusText = `[Очередь] Текущий состав (${activeQueue.length}/${settings.maxQueueSize}): ${playerList}`

    if (statusText.length > 400) {
      sendChatMessage(`${statusText.slice(0, 395)}...`)
      pushLogAboutNotification(`${statusText.slice(0, 395)}...`)
    } else {
      sendChatMessage(statusText)
      pushLogAboutNotification(statusText)
    }
  }, [settings.chatNotificationPermissions.allowSending, settings.maxQueueSize, activeQueue, sendChatMessage, pushLogAboutNotification])

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
    clearBuffer,
    startNotificationCycle,
    stopNotificationCycle,
    sendCurrentQueueStatus,
  }), [
    state,
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedUser,
    addDeniedUser,
    sendMessage,
    clearBuffer,
    startNotificationCycle,
    stopNotificationCycle,
    sendCurrentQueueStatus,
  ])

  return (
    <QueueNotificationContext.Provider value={contextValue}>
      {children}
    </QueueNotificationContext.Provider>
  )
}
