import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { createInitialNotificationState } from '../utils/createInitialNotificationState.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_STATUSES, LOG_SOURCE } from '../../app-logs/types.ts'
import { formatQueueOpenMessage } from '../utils/formatQueueOpenMessage.ts'
import { formatCurrentQueueStatus } from '../utils/formatCurrentQueueStatus.ts'
import { formatQueueCloseMessage } from '../utils/formatQueueCloseMessage.ts'
import { useNotificationCycle } from '../hooks/useNotificationCycle.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'

export const QueueNotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(createInitialNotificationState())

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()
  const { userDisplayName, session } = useAuth()

  const { chatNotificationPermissions: permissions, commands, maxQueueSize, botMessageCooldown } = settings

  const activeQueueRef = useRef<string[]>([])
  const waitingQueueRef = useRef<string[]>([])
  const stateRef = useRef<TwitchNotificationState>(state)
  const isNotificationActiveRef = useRef<boolean>(false)

  // Реф для хранения актуальных разрешений без инвалидации useCallback-функций
  const permissionsRef = useRef(permissions)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Всегда держим Реф разрешений в актуальном состоянии
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
    const actorUsername = userDisplayName ?? session?.login ?? 'Application'
    const logText = `Автоматически отправлено сообщение в чат: ${message}`

    sendChatMessage(message)
    pushLog({
      message: logText,
      status: APP_LOG_STATUSES.SUCCESS,
      source: LOG_SOURCE.APPLICATION,
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
    if (!permissionsRef.current.allowSending) {
      return
    }

    if (text.trim().length > 0) {
      sendAndLogNotification(text)
    }
  }, [sendAndLogNotification])

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

    sendMessage(`[Очередь] Очередь заполнена. Текущий состав: ${getCurrentStatusText()}`)
  }, [getCurrentStatusText, sendMessage])

  const sendClearActive = useCallback(() => {
    if (!permissionsRef.current.onClearActive) {
      return
    }

    setState(currentState => ({
      ...currentState,
      joined: new Set<string>(),
      moved: new Set<string>(),
    }))

    sendMessage('[Очередь] Очередь очищена.')
  }, [sendMessage])

  const sendClearWaiting = useCallback(() => {
    if (!permissionsRef.current.onClearWaiting) {
      return
    }

    setState(currentState => ({
      ...currentState,
      waiting: new Set<string>(),
    }))

    sendMessage('[Очередь] Список ожидающих очищен.')
  }, [sendMessage])

  const sendCurrentQueueStatus = useCallback((): void => {
    sendMessage(`[Очередь] ${getCurrentStatusText()}`)
  }, [getCurrentStatusText, sendMessage])

  const {
    startNotificationCycle: startCycleRaw,
    stopNotificationCycle: stopCycleRaw,
  } = useNotificationCycle({
    botMessageCooldown,
    sendMessage,
    stateRef,
    clearBuffer,
  })

  const startNotificationCycle = useCallback((): void => {
    isNotificationActiveRef.current = true
    setState(createInitialNotificationState())
    startCycleRaw()
  }, [startCycleRaw])

  const stopNotificationCycle = useCallback((): void => {
    isNotificationActiveRef.current = false
    setState(createInitialNotificationState())
    stopCycleRaw()
  }, [stopCycleRaw])

  const addJoinedUser = useCallback((username: string): void => {
    if (!isNotificationActiveRef.current || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.joined.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.joined)
      nextSet.add(username)
      return { ...currentState, joined: nextSet }
    })
  }, [])

  const addWaitingUser = useCallback((username: string): void => {
    if (!isNotificationActiveRef.current || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.waiting.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.waiting)
      nextSet.add(username)
      return { ...currentState, waiting: nextSet }
    })
  }, [])

  const addDeletedUser = useCallback((username: string): void => {
    if (!isNotificationActiveRef.current || !permissionsRef.current.onMemberRemove) return

    setState(currentState => {
      if (currentState.deleted.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.deleted)
      nextSet.add(username)
      return { ...currentState, deleted: nextSet }
    })
  }, [])

  const addMovedUser = useCallback((username: string): void => {
    if (!isNotificationActiveRef.current || !permissionsRef.current.onMemberMove) return

    setState(currentState => {
      if (currentState.moved.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.moved)
      nextSet.add(username)
      return { ...currentState, moved: nextSet }
    })
  }, [])

  const addDeniedUser = useCallback((username: string): void => {
    if (!isNotificationActiveRef.current || !permissionsRef.current.onMemberAdd) return

    setState(currentState => {
      if (currentState.denied.has(username)) {
        return currentState
      }
      const nextSet = new Set(currentState.denied)
      nextSet.add(username)
      return { ...currentState, denied: nextSet }
    })
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
    addMovedUser,
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
