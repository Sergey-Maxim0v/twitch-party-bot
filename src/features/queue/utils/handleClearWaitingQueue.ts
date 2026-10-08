import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleClearWaitingQueueArgs {
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто очистил очередь */
  actorUsername: string;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для полной очистки списка игроков в списке ожидающих.
 */
export const handleClearWaitingQueue = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: HandleClearWaitingQueueArgs): void => {
  let waitingCount:number = 0

  setState(prev => {
    waitingCount = prev.waitingQueue.length

    return {
      ...
      prev,
      waitingQueue:
      [],
    }
  })

  const logMessage = 'Список ожидающих очищен.' + (waitingCount ? ` Удалено ${waitingCount} игроков.` : '')

  pushLog({
    message: logMessage,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
