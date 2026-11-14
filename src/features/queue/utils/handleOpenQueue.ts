import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'

interface HandleOpenQueueArgs {
  /** Текущее состояние открытости очереди. */
  isQueueOpen: boolean;
  /** Функция обновления состояния открытости очереди. */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  /** Источник вызова команды (чат/интерфейс). */
  source: LogSource;
  /** Никнейм того, кто открыл очередь. */
  actorUsername: string;
  /** Хелпер провайдера для записи логов. */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Открывает регистрацию игроков в очередь.
 *
 * @returns `true`, если очередь была открыта этим вызовом.
 */
export const handleOpenQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
}: HandleOpenQueueArgs): boolean => {
  if (isQueueOpen) {
    pushLog({
      message: QUEUE_SESSION_LOG_MESSAGES.ALREADY_OPENED,
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })

    return false
  }

  setIsQueueOpen(true)

  pushLog({
    message: QUEUE_SESSION_LOG_MESSAGES.OPENED,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })

  return true
}
