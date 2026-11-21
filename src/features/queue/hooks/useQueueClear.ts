import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QueueActionLog, QueueState } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleClearActiveQueue } from '../utils/handleClearActiveQueue.ts'
import { handleClearWaitingQueue } from '../utils/handleClearWaitingQueue.ts'
import { handleClearQueueHistory } from '../utils/handleClearQueueHistory.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

interface UseQueueClearArgs {
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хук очистки активной очереди, списка ожидающих и истории сессий.
 */
export const useQueueClear = ({ setState, getState, pushLog }: UseQueueClearArgs) => {
  const { sendClearActive, sendClearWaiting } = useQueueNotification()

  const clearActiveQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
    /** Не писать запись в журнал: результат логирует вызывающая сторона. */
    silent?: boolean;
  }): QueueActionLog => {
    const result = handleClearActiveQueue({ ...args, getState, setState, pushLog })
    sendClearActive()

    return result
  }, [getState, setState, pushLog, sendClearActive])

  const clearWaitingQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
    /** Не писать запись в журнал: результат логирует вызывающая сторона. */
    silent?: boolean;
  }): QueueActionLog => {
    const result = handleClearWaitingQueue({ ...args, getState, setState, pushLog })
    sendClearWaiting()

    return result
  }, [getState, setState, pushLog, sendClearWaiting])

  const clearQueueHistory = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearQueueHistory({ ...args, getState, setState, pushLog })
  }, [getState, setState, pushLog])

  return { clearActiveQueue, clearWaitingQueue, clearQueueHistory }
}
