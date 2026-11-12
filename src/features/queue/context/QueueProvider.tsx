import { type ReactNode, type FC, useMemo, useCallback, useEffect, useRef } from 'react'
import { QueueContext } from './QueueInstance'
import type { QueueContextValue } from './QueueInstance'
import { QUEUE_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { useQueueAutoClose } from '../hooks/useQueueAutoClose.ts'
import { useQueueSession } from '../hooks/useQueueSession.ts'
import { useQueueClear } from '../hooks/useQueueClear.ts'
import { useQueuePlayers } from '../hooks/useQueuePlayers.ts'
import { useQueueStore } from '../hooks/useQueueStore.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { QUEUE_HISTORY_LIMIT, PLAYER_HISTORY_LIMIT } from '../../../constants/queue.constants.ts'
import { limitQueueHistory } from '../utils/limitQueueHistory.ts'
import { limitPlayerHistory } from '../utils/limitPlayerHistory.ts'

interface QueueProviderProps {
  /** Дочерние элементы, получающие доступ к контексту очереди. */
  children: ReactNode;
}

/**
 * Провайдер состояния и методов управления очередью.
 */
export const QueueProvider: FC<QueueProviderProps> = ({ children }) => {
  const { state, setState, getState } = useQueueStore()
  const [isQueueOpen, setIsQueueOpen] = useLocalStorage(QUEUE_STORAGE_KEYS.STATUS, false)

  const { pushLog: pushAppLog } = useAppLogs()
  const { settings } = useQueueSettings()
  const {
    setActiveQueueList,
    setWaitingQueueList,
    sendQueueFullMessage,
  } = useQueueNotification()

  const wasFullRef = useRef<boolean>(false)

  const playerHistorySize = Object.keys(state.playerHistory).length

  // Подрезает историю сессий и игроков, если в localStorage остались данные сверх лимита
  // или другая вкладка прислала больше лимита.
  useEffect(() => {
    if (state.queueHistory.length <= QUEUE_HISTORY_LIMIT && playerHistorySize <= PLAYER_HISTORY_LIMIT) return

    setState(prev => {
      const limitedQueueHistory = limitQueueHistory(prev.queueHistory)
      const limitedPlayerHistory = limitPlayerHistory(prev.playerHistory)

      if (limitedQueueHistory === prev.queueHistory && limitedPlayerHistory === prev.playerHistory) return prev

      return {
        ...prev,
        queueHistory: limitedQueueHistory,
        playerHistory: limitedPlayerHistory,
      }
    })
  }, [setState, state.queueHistory.length, playerHistorySize])

  // Синхронизация списков никнеймов для Twitch-уведомлений
  useEffect(() => {
    setActiveQueueList(state.activeQueue.map(player => player.username))
    setWaitingQueueList(state.waitingQueue.map(player => player.username))
  }, [setActiveQueueList, setWaitingQueueList, state.activeQueue, state.waitingQueue])

  // Отслеживание заполнения очереди и отправка уведомления
  useEffect(() => {
    const isCurrentlyFull = state.activeQueue.length >= settings.maxQueueSize

    if (isCurrentlyFull && !wasFullRef.current) {
      sendQueueFullMessage()
    }

    wasFullRef.current = isCurrentlyFull
  }, [state.activeQueue.length, settings.maxQueueSize, sendQueueFullMessage])

  // Стабильная обёртка над логгером приложения.
  const pushLog: AppLogsContextValue['pushLog'] = useCallback(({ message, status, source, actorUsername, rawCommand }) => {
    pushAppLog({ message, status, source, actorUsername, rawCommand })
  }, [pushAppLog])

  useQueueAutoClose({ setIsQueueOpen, isQueueOpen, pushLog })

  const { openQueue, closeQueue, finishActiveQueue, balanceQueues } = useQueueSession({
    setState,
    getState,
    isQueueOpen,
    setIsQueueOpen,
    pushLog,
  })

  const { clearActiveQueue, clearWaitingQueue, clearQueueHistory } = useQueueClear({
    setState,
    getState,
    pushLog,
  })

  const {
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
  } = useQueuePlayers({
    setState,
    getState,
    isQueueOpen,
    pushLog,
    balanceQueues,
  })

  const contextValue = useMemo<QueueContextValue>(() => ({
    isQueueOpen,
    openQueue,
    closeQueue,
    activeQueue: state.activeQueue,
    waitingQueue: state.waitingQueue,
    queueHistory: state.queueHistory,
    getState,
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
    getState,
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
