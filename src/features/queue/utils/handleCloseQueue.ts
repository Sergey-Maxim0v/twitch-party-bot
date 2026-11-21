import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueActionLog } from '../types.ts'
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
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silent?: boolean;
}

/** Результат закрытия очереди. */
interface CloseQueueResult extends QueueActionLog {
  /** Очередь была закрыта этим вызовом. */
  isClosed: boolean;
}

/**
 * Приостанавливает регистрацию игроков в очередь.
 *
 * @returns Признак закрытия и данные для журнала приложения.
 */
export const handleCloseQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
  message = QUEUE_SESSION_LOG_MESSAGES.CLOSED,
  silent = false,
}: HandleCloseQueueArgs): CloseQueueResult => {
  const isClosed = isQueueOpen

  if (isClosed) {
    setIsQueueOpen(false)
  }

  const result: CloseQueueResult = {
    isClosed,
    message: isClosed ? message : QUEUE_SESSION_LOG_MESSAGES.ALREADY_CLOSED,
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  if (!silent) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
