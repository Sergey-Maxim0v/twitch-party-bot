import { type ReactNode, type FC, useMemo, useCallback, useEffect, useRef } from 'react'
import { QueueContext } from './QueueInstance'
import type { QueueContextValue } from './QueueInstance'
import type { QueueState } from '../types'
import { createInitialState } from '../utils/createInitialState'
import { STORAGE_KEY } from '../constants.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { useQueueAutoClose } from '../hooks/useQueueAutoClose.ts'
import { useQueueSession } from '../hooks/useQueueSession.ts'
import { useQueueClear } from '../hooks/useQueueClear.ts'
import { useQueuePlayers } from '../hooks/useQueuePlayers.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'

interface QueueProviderProps {
  children: ReactNode;
}

export const QueueProvider: FC<QueueProviderProps> = ({ children }) => {
  const [state, setState] = useLocalStorage<QueueState>(STORAGE_KEY, createInitialState())
  const [isQueueOpen, setIsQueueOpen] = useLocalStorage('twitch_queue_status', false)

  const { pushLog: pushAppLog } = useAppLogs()
  const { settings } = useQueueSettings()
  const {
    setActiveQueueList,
    setWaitingQueueList,
    sendQueueFullMessage,
  } = useQueueNotification()

  const wasFullRef = useRef<boolean>(false)

  // Синхронизация списков никнеймов для Twitch-уведомлений
  useEffect(() => {
    setActiveQueueList(state.activeQueue.map(player => player.username))
    setWaitingQueueList(state.waitingQueue.map(player => player.username))
  }, [setActiveQueueList, setWaitingQueueList, state.activeQueue, state.waitingQueue])

  // Отслеживание заполнения очереди и отправка уведомления
  useEffect(() => {
    if (!isQueueOpen) {
      wasFullRef.current = false
      return
    }

    const isCurrentlyFull = state.activeQueue.length >= settings.maxQueueSize

    if (isCurrentlyFull && !wasFullRef.current) {
      sendQueueFullMessage()
    }

    wasFullRef.current = isCurrentlyFull
  }, [isQueueOpen, state.activeQueue.length, settings.maxQueueSize, sendQueueFullMessage])

  // Изолированная обёртка для логирования
  const pushLog: AppLogsContextValue['pushLog'] = useCallback(({ message, status, source, actorUsername, rawCommand }) => {
    pushAppLog({ message, status, source, actorUsername, rawCommand })
  }, [pushAppLog])

  // Автоматическое закрытие очереди
  useQueueAutoClose({ setIsQueueOpen, isQueueOpen, pushLog })

  // Инициализация группы методов сессии
  const { openQueue, closeQueue, finishActiveQueue, balanceQueues } = useQueueSession({
    setState,
    isQueueOpen,
    setIsQueueOpen,
    pushLog,
  })

  // Инициализация группы методов очистки списков
  const { clearActiveQueue, clearWaitingQueue, clearQueueHistory } = useQueueClear({
    setState,
    pushLog,
  })

  // Инициализация группы методов управления игроками
  const {
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
  } = useQueuePlayers({
    setState,
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
