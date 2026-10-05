import { type ReactNode, type FC, useMemo, useCallback } from 'react'
import { QueueContext } from './QueueInstance'
import type { QueueContextValue } from './QueueInstance'
import type { QueueState, QueuePlayerFormData, QueueType } from '../types'
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
import { handleJoinPlayer } from '../utils/handleJoinPlayer.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleBalanceQueues } from '../utils/handleBalanceQueues.ts'
import { handleCloseQueue } from '../utils/handleCloseQueue.ts'
import { handleOpenQueue } from '../utils/handleOpenQueue.ts'

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider: FC<QueueProviderProps> = ({ children }) => {
  const { settings, updateSettings } = useQueueSettings()
  const [state, setState] = useLocalStorage<QueueState>(STORAGE_KEY, createInitialState())
  const { pushLog: pushAppLog } = useAppLogs()
  const [isQueueOpen, setIsQueueOpen] = useLocalStorage('twitch_queue_status', false)

  const pushLog: AppLogsContextValue['pushLog'] = useCallback(({
    message,
    status,
    source,
    actorUsername,
    rawCommand,
  }) => {
    pushAppLog({
      message,
      status,
      source,
      actorUsername,
      rawCommand,
    })
  }, [pushAppLog])

  // === СИНХРОНИЗАЦИЯ И БАЛАНСИРОВКА ОЧЕРЕДИ ===

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

  // === СТАТУС ОЧЕРЕДИ (Управление) ===

  const openQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleOpenQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })
  }, [isQueueOpen, setIsQueueOpen, pushLog])

  const closeQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleCloseQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })
  }, [isQueueOpen, setIsQueueOpen, pushLog])

  // === МЕТОДЫ ОЧИСТКИ (Clear) ===

  const clearActiveQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearActiveQueue({ ...args, setState, pushLog })
  }, [setState, pushLog])

  const clearWaitingQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearWaitingQueue({ ...args, setState, pushLog })
  }, [setState, pushLog])

  const clearQueueHistory = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearQueueHistory({ ...args, setState, pushLog })
  }, [setState, pushLog])

  // === УПРАВЛЕНИЕ ИГРОКАМИ (CRUD) ===

  const addPlayerToQueue: QueueContextValue['addPlayerToQueue'] = useCallback((args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => {
    handleJoinPlayer({ ...args, isQueueOpen, settings, setState, pushLog })
  }, [isQueueOpen, settings, setState, pushLog])

  const removePlayerFromQueue: QueueContextValue['removePlayerFromQueue'] = useCallback((args: {
    userId: string;
    targetQueueType: QueueType;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayer({ ...args, setState, pushLog })
    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [setState, pushLog, balanceQueues])

  const removePlayerFromAllQueues: QueueContextValue['removePlayerFromAllQueues'] = useCallback((args: {
    userId: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayerFromAll({ ...args, setState, pushLog })
    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [setState, pushLog, balanceQueues])

  const banPlayerFromQueue: QueueContextValue['banPlayerFromQueue'] = useCallback((args: {
    userId?: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    const { userId = '', source, actorUsername, username, displayedUsername } = args

    handleBanPlayer({ ...args, settings, updateSettings, pushLog })
    removePlayerFromAllQueues({ userId, actorUsername, source, username, displayedUsername })
    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [settings, updateSettings, pushLog, removePlayerFromAllQueues, balanceQueues])

  const movePlayer: QueueContextValue['movePlayer'] = useCallback((args: {
    userId: string;
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleMovePlayer({ ...args, setState, pushLog })

    if (settings.moveOnSizeChange) {
      const { source, actorUsername } = args

      balanceQueues({
        source,
        actorUsername,
      })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues])

  // === ЖИЗНЕННЫЙ ЦИКЛ ОЧЕРЕДИ ===

  const finishActiveQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    // 1. Архивируем текущую сессию в историю
    handleFinishActiveQueue({ ...args, setState, pushLog })

    // 2. Если pre-join выключен и очередь была открыта — закрываем её
    if (!settings.allowPreJoin && isQueueOpen) {
      closeQueue({ source: args.source, actorUsername: args.actorUsername })
    }

    // 3. Заполняем освободившиеся места из списка ожидания
    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [closeQueue, settings.allowPreJoin, isQueueOpen, setState, pushLog, balanceQueues])

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
    movePlayer,
    finishActiveQueue,
    balanceQueues,
  ])

  return <QueueContext.Provider value={contextValue}>{children}</QueueContext.Provider>
}
