import { type ReactNode, type FC, useMemo, useCallback, useEffect } from 'react'
import { QueueContext } from './QueueInstance'
import type { QueueContextValue } from './QueueInstance'
import { type QueueState, type QueuePlayerFormData, type QueueType, QUEUE_TYPES } from '../types'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings'
import { createInitialState } from '../utils/createInitialState'
import { STORAGE_KEY } from '../constants.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { handleClearActiveQueue } from '../utils/handleClearActiveQueue.ts'
import { handleClearWaitingQueue } from '../utils/handleClearWaitingQueue.ts'
import { handleClearQueueHistory } from '../utils/handleClearQueueHistory.ts'
import { handleRemovePlayer } from '../utils/handleRemovePlayer.ts'
import { handleRemovePlayerFromAll } from '../utils/handleRemovePlayerFromAll.ts'
import { handleBanPlayer } from '../utils/handleBanPlayer.ts'
import { handleMovePlayer } from '../utils/handleMovePlayer.ts'
import { handleFinishActiveQueue } from '../utils/handleFinishActiveQueue.ts'
import { handleJoinPlayer, JOIN_QUEUE_STATUSES } from '../utils/handleJoinPlayer.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleBalanceQueues } from '../utils/handleBalanceQueues.ts'
import { handleCloseQueue } from '../utils/handleCloseQueue.ts'
import { handleOpenQueue } from '../utils/handleOpenQueue.ts'
import { handleUnbanPlayer } from '../utils/handleUnbanPlayer.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { useQueueAutoClose } from '../hooks/useQueueAutoClose.ts'

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider: FC<QueueProviderProps> = ({ children }) => {
  const [state, setState] = useLocalStorage<QueueState>(STORAGE_KEY, createInitialState())
  const [isQueueOpen, setIsQueueOpen] = useLocalStorage('twitch_queue_status', false)

  const { settings, updateSettings } = useQueueSettings()
  const { pushLog: pushAppLog } = useAppLogs()
  const {
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedUser,
    addDeniedUser,
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    startNotificationCycle,
    stopNotificationCycle,
    setActiveQueueList,
    setWaitingQueueList,
  } = useQueueNotification()

  // Эффект сохранения списков никнеймов для отправки уведомлений в Twitch чат.
  useEffect(() => {
    setActiveQueueList(state.activeQueue.map(player => player.username))
    setWaitingQueueList(state.waitingQueue.map(player => player.username))
  }, [setActiveQueueList, setWaitingQueueList, state.activeQueue, state.waitingQueue])

  const pushLog: AppLogsContextValue['pushLog'] = useCallback(({ message, status, source, actorUsername, rawCommand }) => {
    pushAppLog({ message, status, source, actorUsername, rawCommand })
  }, [pushAppLog])

  // Автоматическое закрытие очереди при смене канала или закрытии вкладки
  useQueueAutoClose({ setIsQueueOpen, isQueueOpen, pushLog })

  const balanceQueues = useCallback((args: {
    source: LogSource;
    actorUsername: string;
    overrideMaxQueueSize?: number;
    overrideMoveOnSizeChange?: boolean;
    overrideAllowPreJoin?: boolean;
  }) => {
    handleBalanceQueues({
      maxQueueSize: args.overrideMaxQueueSize ?? settings.maxQueueSize,
      moveOnSizeChange: args.overrideMoveOnSizeChange ?? settings.moveOnSizeChange,
      allowPreJoin: args.overrideAllowPreJoin ?? settings.allowPreJoin,
      setState,
      pushLog,
      source: args.source,
      actorUsername: args.actorUsername,
    })
  }, [settings.maxQueueSize, settings.moveOnSizeChange, settings.allowPreJoin, setState, pushLog])

  const openQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleOpenQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })
    sendMessageOpen()
    startNotificationCycle()
  }, [isQueueOpen, setIsQueueOpen, pushLog, sendMessageOpen, startNotificationCycle])

  const closeQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleCloseQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })
    sendMessageClose()
    stopNotificationCycle()
  }, [isQueueOpen, setIsQueueOpen, pushLog, sendMessageClose, stopNotificationCycle])

  const clearActiveQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearActiveQueue({ ...args, setState, pushLog })
    sendMessage('Очередь очищена')
  }, [setState, pushLog, sendMessage])

  const clearWaitingQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearWaitingQueue({ ...args, setState, pushLog })
    sendMessage('Список ожидания очищен')
  }, [setState, pushLog, sendMessage])

  const clearQueueHistory = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearQueueHistory({ ...args, setState, pushLog })
  }, [setState, pushLog])

  const addPlayerToQueue: QueueContextValue['addPlayerToQueue'] = useCallback((args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => {
    const result = handleJoinPlayer({ ...args, isQueueOpen, settings, setState, pushLog })

    if (result.status === JOIN_QUEUE_STATUSES.JOINED) {
      addJoinedUser(args.playerData.username)
    } else if (result.status === JOIN_QUEUE_STATUSES.WAITING) {
      addWaitingUser(args.playerData.username)
    } else if (result.status === JOIN_QUEUE_STATUSES.DENIED) {
      addDeniedUser(args.playerData.username)
    }
  }, [isQueueOpen, settings, setState, pushLog, addJoinedUser, addWaitingUser, addDeniedUser])

  const removePlayerFromQueue: QueueContextValue['removePlayerFromQueue'] = useCallback((args: {
    userId: string;
    username: string;
    targetQueueType: QueueType;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayer({ ...args, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)

    if(settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addDeletedUser])

  const removePlayerFromAllQueues: QueueContextValue['removePlayerFromAllQueues'] = useCallback((args: {
    userId: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayerFromAll({ ...args, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)

    if(settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addDeletedUser])

  const banPlayerFromQueue: QueueContextValue['banPlayerFromQueue'] = useCallback((args: {
    userId?: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    const { userId = '', source, actorUsername, username, displayedUsername } = args

    const { isBanned } = handleBanPlayer({ ...args, settings, updateSettings, pushLog })

    if(isBanned) {
      removePlayerFromAllQueues({ userId, actorUsername, source, username, displayedUsername })
    }
    
    if(isBanned && settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [settings, updateSettings, pushLog, removePlayerFromAllQueues, balanceQueues])

  const unbanPlayerFromQueue = useCallback((args: {
    username: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleUnbanPlayer({ ...args, settings, updateSettings, pushLog })
  }, [settings, updateSettings, pushLog])

  const movePlayer: QueueContextValue['movePlayer'] = useCallback((args: {
    userId: string;
    username: string;
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleMovePlayer({ ...args, setState, pushLog })

    if (args.targetQueueType === QUEUE_TYPES.ACTIVE) {
      addMovedUser(args.displayedUsername ?? args.username)
    }

    if (settings.moveOnSizeChange) {
      const { source, actorUsername } = args
      balanceQueues({ source, actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addMovedUser])

  const finishActiveQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleFinishActiveQueue({
      setState,
      onSuccess: (playedPlayers, sessionNumber) => {
        const nicknames = playedPlayers
          .map(user => `@${user.displayedUsername ?? user.username}`)
          .join(', ')

        sendMessage(`Очередь завершена. Сейчас играют: ${nicknames}`)

        pushLog({
          message: `Состав №${sessionNumber} завершен (игроков: ${playedPlayers.length}).`,
          status: APP_LOG_STATUSES.WARNING,
          source: args.source,
          actorUsername: args.actorUsername,
        })
      },
      onEmpty: () => {
        pushLog({
          message: 'Не удалось завершить сессию: активная очередь пуста.',
          status: APP_LOG_STATUSES.WARNING,
          source: args.source,
          actorUsername: args.actorUsername,
        })
      },
    })

    if (isQueueOpen) {
      closeQueue({ source: args.source, actorUsername: args.actorUsername })
    }

    if (settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, sendMessage, pushLog, isQueueOpen, settings.moveOnSizeChange, closeQueue, balanceQueues])

  const contextValue = useMemo<QueueContextValue>(() => ({
    isQueueOpen,
    openQueue,
    closeQueue,
    activeQueue: state.activeQueue || [],
    waitingQueue: state.waitingQueue || [],
    queueHistory: state.queueHistory || [],
    rawState: state,
    clearActiveQueue,
    clearWaitingQueue,
    clearQueueHistory,
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
    finishActiveQueue,
    balanceQueues,
  }), [
    isQueueOpen,
    openQueue,
    closeQueue,
    state,
    clearActiveQueue,
    clearWaitingQueue,
    clearQueueHistory,
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
    finishActiveQueue,
    balanceQueues,
  ])

  return <QueueContext.Provider value={contextValue}>{children}</QueueContext.Provider>
}
