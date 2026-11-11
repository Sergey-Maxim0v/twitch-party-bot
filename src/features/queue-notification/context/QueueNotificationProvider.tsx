import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { createInitialNotificationState } from '../utils/createInitialNotificationState.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_STATUSES, APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { APP_LOG_FALLBACK_ACTOR } from '../../../constants/app-logs.constants.ts'
import { QUEUE_CHAT_NOTIFICATION_MESSAGES } from '../../../constants/queue.constants.ts'
import { formatQueueOpenMessage } from '../utils/formatQueueOpenMessage.ts'
import { formatCurrentQueueStatus } from '../utils/formatCurrentQueueStatus.ts'
import { formatQueueCloseMessage } from '../utils/formatQueueCloseMessage.ts'
import { useNotificationCycle } from '../hooks/useNotificationCycle.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'
import { useNotificationGuard } from '../hooks/useNotificationGuard.ts'
import { useNotificationActions } from '../hooks/useNotificationActions.ts'

/**
 * Провайдер автоматических уведомлений о событиях очереди.
 * Накапливает изменения в буфере и периодически отправляет их в чат Twitch.
 */
export const QueueNotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(createInitialNotificationState())

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()
  const { userDisplayName, session } = useAuth()

  const { chatNotificationPermissions: permissions, commands, maxQueueSize, botMessageCooldown } = settings

  const isReadyForAutomations = useNotificationGuard()

  const activeQueueRef = useRef<string[]>([])
  const waitingQueueRef = useRef<string[]>([])
  const stateRef = useRef<TwitchNotificationState>(state)
  const permissionsRef = useRef(permissions)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    permissionsRef.current = permissions
  }, [permissions])

  const setActiveQueueList = useCallback((list: string[]): void => {
    activeQueueRef.current = list
  }, [])

  const setWaitingQueueList = useCallback((list: string[]): void => {
    waitingQueueRef.current = list
  }, [])

  const clearBuffer = useCallback((): void => {
    setState(createInitialNotificationState())
  }, [])

  const sendAndLogNotification = useCallback((message: string): void => {
    const actorUsername = userDisplayName ?? session?.login ?? APP_LOG_FALLBACK_ACTOR
    const logText = `Автоматически отправлено сообщение в чат: ${message}`

    sendChatMessage(message)
    pushLog({
      message: logText,
      status: APP_LOG_STATUSES.SUCCESS,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })
  }, [sendChatMessage, pushLog, session?.login, userDisplayName])

  const getCurrentStatusText = useCallback((): string => {
    return formatCurrentQueueStatus({
      activeUsernames: activeQueueRef.current,
      waitingUsernames: waitingQueueRef.current,
      maxQueueSize,
    })
  }, [maxQueueSize])

  const sendMessage = useCallback((text: string): void => {
    if (!isReadyForAutomations || !permissionsRef.current.allowSending) {
      return
    }

    if (text.trim().length === 0) {
      return
    }

    sendAndLogNotification(text)
  }, [sendAndLogNotification, isReadyForAutomations])

  const sendMessageOpen = useCallback((): void => {
    setState(createInitialNotificationState())

    if (!permissionsRef.current.onQueueOpen) {
      return
    }

    const messageText = formatQueueOpenMessage({ commands, prefix: settings.messagePrefix })
    sendMessage(messageText)
  }, [commands, sendMessage, settings.messagePrefix])

  const sendMessageClose = useCallback((): void => {
    setState(createInitialNotificationState())

    if (!permissionsRef.current.onQueueClose) {
      return
    }

    const messageText = formatQueueCloseMessage({ queueStatusText: getCurrentStatusText(), prefix: settings.messagePrefix })
    sendMessage(messageText)
  }, [getCurrentStatusText, sendMessage, settings.messagePrefix])

  const sendQueueFullMessage = useCallback((): void => {
    if (!permissionsRef.current.onQueueFull) {
      return
    }

    const statusText = getCurrentStatusText()

    sendMessage(
      settings.messagePrefix
        ? `${settings.messagePrefix} ${QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_FULL} Текущий состав: ${statusText}`
        : `${QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_FULL} Текущий состав: ${statusText}`,
    )
  }, [getCurrentStatusText, sendMessage, settings.messagePrefix])

  const sendClearActive = useCallback((): void => {
    if (!permissionsRef.current.onClearActive) {
      return
    }

    setState(currentState => ({
      ...currentState,
      joined: new Set<string>(),
      movedToActive: new Set<string>(),
    }))

    sendMessage(
      settings.messagePrefix
        ? `${settings.messagePrefix} ${QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ACTIVE}`
        : QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ACTIVE,
    )
  }, [sendMessage, settings.messagePrefix])

  const sendClearWaiting = useCallback((): void => {
    if (!permissionsRef.current.onClearWaiting) {
      return
    }

    setState(currentState => ({
      ...currentState,
      waiting: new Set<string>(),
      movedToWaiting: new Set<string>(),
    }))

    sendMessage(
      settings.messagePrefix
        ? `${settings.messagePrefix} ${QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_WAITING}`
        : QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_WAITING,
    )
  }, [sendMessage, settings.messagePrefix])

  const sendCurrentQueueStatus = useCallback((): void => {
    const statusText = getCurrentStatusText()

    sendMessage(settings.messagePrefix ? `${settings.messagePrefix} ${statusText}` : statusText)
  }, [getCurrentStatusText, sendMessage, settings.messagePrefix])

  const {
    startNotificationCycle,
    stopNotificationCycle,
  } = useNotificationCycle({
    botMessageCooldown,
    sendMessage,
    stateRef,
    clearBuffer,
  })

  useEffect(() => {
    startNotificationCycle()
    return () => {
      stopNotificationCycle()
    }
  }, [startNotificationCycle, stopNotificationCycle])

  const {
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeniedUser,
  } = useNotificationActions({ permissionsRef, setState })

  const contextValue = useMemo<QueueNotificationContextType>(() => ({
    notificationBuffer: state,
    setNotificationBuffer: setState,
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeniedUser,
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    sendQueueFullMessage,
    sendClearActive,
    sendClearWaiting,
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
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeniedUser,
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    sendQueueFullMessage,
    sendClearActive,
    sendClearWaiting,
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
