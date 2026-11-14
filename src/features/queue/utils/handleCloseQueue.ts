import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'

interface HandleCloseQueueArgs {
  /** Текущее состояние открытости очереди. */
  isQueueOpen: boolean;
  /** Функция обновления состояния открытости очереди. */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  /** Источник вызова команды (чат/интерфейс). */
  source: LogSource;
  /** Никнейм того, кто закрыл очередь. */
  actorUsername: string;
  /** Хелпер провайдера для записи логов. */
  pushLog: AppLogsContextValue['pushLog'];
  /** Причина закрытия для журнала; по умолчанию — стандартное сообщение. */
  message?: string;
}

/**
 * Приостанавливает регистрацию игроков в очередь.
 */
export const handleCloseQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
  message = QUEUE_SESSION_LOG_MESSAGES.CLOSED,
}: HandleCloseQueueArgs): void => {
  if (!isQueueOpen) {
    pushLog({
      message: QUEUE_SESSION_LOG_MESSAGES.ALREADY_CLOSED,
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })

    return
  }

  setIsQueueOpen(false)

  pushLog({
    message,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
