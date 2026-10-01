import { type ReactNode, type FC, useMemo, useCallback, useEffect } from 'react'
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
import { APP_LOG_STATUSES, LOG_SOURCE, type LogSource } from '../../app-logs/types.ts'
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
  useEffect(() => {
    handleBalanceQueues({
      maxQueueSize: settings.maxQueueSize,
      moveOnSizeChange: settings.moveOnSizeChange,
      allowPreJoin: settings.allowPreJoin,
      activeLength: state.activeQueue.length,
      waitingLength: state.waitingQueue.length,
      setState,
      pushLog,
    })
  }, [
    settings.maxQueueSize,
    settings.moveOnSizeChange,
    settings.allowPreJoin,
    state.activeQueue.length,
    state.waitingQueue.length,
    setState,
    pushLog,
  ])

  // === АВТОМАТИЧЕСКАЯ ОЧИСТКА СПИСКА ОЖИДАЮЩИХ ПРИ ОТКЛЮЧЕНИИ ПРЕДВАРИТЕЛЬНОЙ ЗАПИСИ ===
  useEffect(() => {
    if (!settings.allowPreJoin && state.waitingQueue.length > 0) {
      const count = state.waitingQueue.length

      pushLog({
        message: `Список ожидающих отключен в настройках. Список ожидающих автоматически очищен (удалено игроков: ${count}).`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: LOG_SOURCE.APPLICATION,
        actorUsername: 'System',
      })

      setState(prev => ({
        ...prev,
        waitingQueue: [],
      }))
    }
  }, [settings.allowPreJoin, state.waitingQueue.length, setState, pushLog])

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
    handleJoinPlayer({ ...args, isQueueOpen, state, settings, setState, pushLog })
  }, [isQueueOpen, state, settings, setState, pushLog])

  const removePlayerFromQueue: QueueContextValue['removePlayerFromQueue'] = useCallback((args: {
    userId: string;
    targetQueueType: QueueType;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayer({ ...args, state, setState, pushLog })
  }, [state, setState, pushLog])

  const removePlayerFromAllQueues = useCallback((args: {
    userId: string;
    username: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayerFromAll({ ...args, state, setState, pushLog })
  }, [state, setState, pushLog])

  const banPlayerFromQueue = useCallback((args: {
    userId?: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleBanPlayer({ ...args, settings, updateSettings, setState, pushLog })
  }, [settings, updateSettings, setState, pushLog])

  const movePlayer = useCallback((args: {
    userId: string;
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleMovePlayer({ ...args, setState, pushLog })
  }, [setState, pushLog])

  // === ЖИЗНЕННЫЙ ЦИКЛ ОЧЕРЕДИ ===

  const finishActiveQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleFinishActiveQueue({ ...args, closeQueue, settings, setState, pushLog })
  }, [closeQueue, settings, setState, pushLog])

  const contextValue = useMemo<QueueContextValue>(() => ({
    isQueueOpen,
    openQueue,
    closeQueue,
    activeQueue: state.activeQueue || [],
    waitingQueue: state.waitingQueue || [],
    queueHistory: state.queueHistory || [],
    rawState: state,
    clearActiveQueue,
    clearWaitingQueue: clearWaitingQueue,
    clearQueueHistory,
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    movePlayer,
    finishActiveQueue,
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
  ])

  return <QueueContext.Provider value={contextValue}>{children}</QueueContext.Provider>
}
