import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueActionLog } from '../types.ts'
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
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
}

/** Результат открытия очереди. */
interface OpenQueueResult extends QueueActionLog {
  /** Очередь была открыта этим вызовом. */
  isOpened: boolean;
}

/**
 * Открывает регистрацию игроков в очередь.
 *
 * @returns Признак открытия и данные для журнала приложения.
 */
export const handleOpenQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  source,
  actorUsername,
  pushLog,
  silentLog = false,
}: HandleOpenQueueArgs): OpenQueueResult => {
  const isOpened = !isQueueOpen

  if (isOpened) {
    setIsQueueOpen(true)
  }

  const result: OpenQueueResult = {
    isOpened,
    message: isOpened ? QUEUE_SESSION_LOG_MESSAGES.OPENED : QUEUE_SESSION_LOG_MESSAGES.ALREADY_OPENED,
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  if (!silentLog) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
