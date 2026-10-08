import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleCloseQueueArgs {
  /** Текущее состояние открытости очереди */
  isQueueOpen: boolean;
  /** Функция обновления состояния открытости очереди */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  /** Источник вызова команды (чат/интерфейс) */
  source: LogSource;
  /** Никнейм того, кто закрыл очередь */
  actorUsername: string;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для приостановки регистрации игроков в очередь.
 */
export const handleCloseQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
}: HandleCloseQueueArgs): void => {
  if(!isQueueOpen) {
    pushLog({
      message: 'Очередь уже закрыта.',
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })
    return
  }

  setIsQueueOpen(false)

  pushLog({
    message: 'Закрыта очередь, добавлять в очередь могут только модераторы в чате и пользователь приложения.',
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
