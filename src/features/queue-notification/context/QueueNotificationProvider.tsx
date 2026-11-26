import { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { createInitialNotificationState } from '../utils/createInitialNotificationState.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_STATUSES, APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_CHAT_MESSAGE_SEPARATOR, QUEUE_CHAT_NOTIFICATION_MESSAGES, QUEUE_FULL_STATUS_HEADER } from '../../../constants/queue.constants.ts'
import { formatQueueOpenMessage } from '../utils/formatQueueOpenMessage.ts'
import { formatQueueStatusMessage } from '../utils/formatQueueStatusMessage.ts'
import { formatPrefixedMessage } from '../utils/formatPrefixedMessage.ts'
import { removeActiveQueueUsersFromBuffer } from '../utils/removeActiveQueueUsersFromBuffer.ts'
import { resolveClearNotificationMessage } from '../utils/resolveClearNotificationMessage.ts'
import { useNotificationCycle } from '../hooks/useNotificationCycle.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'
import { useNotificationGuard } from '../hooks/useNotificationGuard.ts'
import { useNotificationActions } from '../hooks/useNotificationActions.ts'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { TWITCH_CHAT_ACCESS_STATUSES } from '../../../services/socket/types.ts'
import type { ChildrenProps } from '../../../types/common.types.ts'

/**
 * Провайдер автоматических уведомлений о событиях очереди.
 * Накапливает изменения в буфере и периодически отправляет их в чат Twitch.
 */
export const QueueNotificationProvider: FC<ChildrenProps> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(createInitialNotificationState())

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()
  const actorUsername = useActorUsername()
  const socketContext = useSocketContext()

  const chatAccessStatus = socketContext?.chatAccessStatus ?? TWITCH_CHAT_ACCESS_STATUSES.OFFLINE

  const { chatNotificationPermissions: permissions, commands, maxQueueSize, botMessageCooldown } = settings

  const isReadyForAutomations = useNotificationGuard()

  const activeQueueRef = useRef<string[]>([])
  const waitingQueueRef = useRef<string[]>([])
  const stateRef = useRef<TwitchNotificationState>(state)
  const permissionsRef = useRef(permissions)
  const isBannedNotificationLoggedRef = useRef(false)

  useEffect(() => {
    if (chatAccessStatus !== TWITCH_CHAT_ACCESS_STATUSES.BANNED) {
      isBannedNotificationLoggedRef.current = false
    }
  }, [chatAccessStatus])

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

  const sendAndLogNotification = useCallback((message: string): boolean => sendChatMessage(message, {
    isAutomated: true,
    onConfirmed: () => {
      pushLog({
        message: `Автоматически отправлено сообщение в чат: ${message}`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername,
      })
    },
    onFailed: reason => {
      pushLog({
        message: `Не удалось отправить сообщение в чат: ${message}. Причина: ${reason}`,
        status: APP_LOG_STATUSES.ERROR,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername,
      })
    },
  }), [sendChatMessage, pushLog, actorUsername])

  const formatQueueStatus = useCallback((header?: string, separator?: string): string => formatQueueStatusMessage({
    activeUsernames: activeQueueRef.current,
    waitingUsernames: waitingQueueRef.current,
    maxQueueSize,
    marks: settings.marks,
    prefix: settings.messagePrefix,
    header,
    separator,
  }), [maxQueueSize, settings.marks, settings.messagePrefix])

  const sendMessage = useCallback((text: string): boolean => {
    if (!permissionsRef.current.allowSending) {
      return true
    }

    // Чат недоступен — сохраняем буфер до восстановления
    const shouldLogBan = !isReadyForAutomations
      && chatAccessStatus === TWITCH_CHAT_ACCESS_STATUSES.BANNED
      && !isBannedNotificationLoggedRef.current

    if (shouldLogBan) {
      pushLog({
        message: 'Отправка уведомлений приостановлена: аккаунт забанен. Накопленные события будут отправлены после восстановления доступа.',
        status: APP_LOG_STATUSES.WARNING,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername,
      })
      isBannedNotificationLoggedRef.current = true
    }

    if (!isReadyForAutomations) {
      return false
    }

    if (text.trim().length === 0) {
      return true
    }

    return sendAndLogNotification(text)
  }, [sendAndLogNotification, isReadyForAutomations, chatAccessStatus, pushLog, actorUsername])

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

    sendMessage(formatQueueStatus(QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_CLOSED, QUEUE_CHAT_MESSAGE_SEPARATOR))
  }, [formatQueueStatus, sendMessage])

  const sendQueueFullMessage = useCallback((): void => {
    if (!permissionsRef.current.onQueueFull) {
      return
    }

    const messageText = formatQueueStatus(QUEUE_FULL_STATUS_HEADER)
    const isSent = sendMessage(messageText)

    if (!isSent || !permissionsRef.current.allowSending) {
      return
    }

    setState(currentState => removeActiveQueueUsersFromBuffer({
      state: currentState,
      activeUsernames: activeQueueRef.current,
    }))
  }, [formatQueueStatus, sendMessage])

  const sendClearActive = useCallback((notify = true): void => {
    if (!permissionsRef.current.onClearActive) {
      return
    }

    setState(currentState => ({
      ...currentState,
      joined: new Set<string>(),
      movedToActive: new Set<string>(),
    }))

    if (!notify) {
      return
    }

    sendMessage(formatPrefixedMessage(QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ACTIVE, settings.messagePrefix))
  }, [sendMessage, settings.messagePrefix])

  const sendClearWaiting = useCallback((notify = true): void => {
    if (!permissionsRef.current.onClearWaiting) {
      return
    }

    setState(currentState => ({
      ...currentState,
      waiting: new Set<string>(),
      movedToWaiting: new Set<string>(),
    }))

    if (!notify) {
      return
    }

    sendMessage(formatPrefixedMessage(QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_WAITING, settings.messagePrefix))
  }, [sendMessage, settings.messagePrefix])

  const sendClearAll = useCallback((): void => {
    const message = resolveClearNotificationMessage(permissionsRef.current)
    if (!message) {
      return
    }

    sendMessage(formatPrefixedMessage(message, settings.messagePrefix))
  }, [sendMessage, settings.messagePrefix])

  const sendCurrentQueueStatus = useCallback((): void => {
    sendMessage(formatQueueStatus())
  }, [formatQueueStatus, sendMessage])

  const {
    startNotificationCycle,
    stopNotificationCycle,
  } = useNotificationCycle({
    botMessageCooldown,
    sendMessage,
    stateRef,
    clearBuffer,
  })

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
    sendClearAll,
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
    sendClearAll,
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
