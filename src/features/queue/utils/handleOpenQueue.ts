import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleOpenQueueArgs {
  /** Текущее состояние открытости очереди */
  isQueueOpen: boolean;
  /** Функция обновления состояния открытости очереди */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  /** Источник вызова команды (чат/интерфейс) */
  source: LogSource;
  /** Никнейм того, кто открыл очередь */
  actorUsername: string;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для открытия регистрации игроков в очередь.
 */
export const handleOpenQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
}: HandleOpenQueueArgs): void => {
  if(isQueueOpen) {
    pushLog({
      message: 'Очередь уже открыта.',
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })
    return
  }

  setIsQueueOpen(true)

  pushLog({
    message: 'Прием заявок в очередь открыт.',
    status: APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
  })
}
