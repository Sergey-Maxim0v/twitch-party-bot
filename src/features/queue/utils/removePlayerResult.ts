import type { QueueActionLog } from '../types.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'

/** Общая часть решения об удалении игрока. */
export interface RemovePlayerDecision {
  /** Текст для лога. */
  logMessage: string;
  /** Операция завершилась ошибкой. */
  isError: boolean;
  /** Имя найденного игрока. */
  playerName: string;
}

/** Результат удаления: лог, факт удаления и имя игрока. */
export interface RemovePlayerResult extends QueueActionLog {
  /** Игрок фактически удалён. */
  isRemoved: boolean;
  /** Имя найденного игрока. */
  playerName: string;
}

/** Собирает результат удаления из решения обработчика. */
export const toRemovePlayerResult = ({
  logMessage,
  isError,
  playerName,
}: RemovePlayerDecision): RemovePlayerResult => ({
  message: logMessage,
  logStatus: isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
  isRemoved: !isError,
  playerName,
})
