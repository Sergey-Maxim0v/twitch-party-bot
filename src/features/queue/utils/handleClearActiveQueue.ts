import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleClearActiveQueueArgs {
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
 * Хендлер для полной очистки списка игроков в текущей активной очереди.
 */
export const handleClearActiveQueue = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: HandleClearActiveQueueArgs): void => {
  setState(prev => ({
    ...prev,
    activeQueue: [],
  }))

  pushLog({
    message: 'Текущая очередь очищена.',
    status: APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
  })
}
