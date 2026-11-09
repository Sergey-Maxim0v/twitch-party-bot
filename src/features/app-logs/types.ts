import { APP_LOG_SOURCES, APP_LOG_STATUSES } from '../../constants/app-log.constants.ts'

export { APP_LOG_SOURCES, APP_LOG_STATUSES }

export type AppLogStatus = typeof APP_LOG_STATUSES[keyof typeof APP_LOG_STATUSES]

/**
 * Структура лога одного действия в очереди
 */
export interface AppLogItem {
  id: string;
  timestamp: number;
  /** Источник инициации действия */
  source: LogSource;
  /** Никнейм того, кто инициировал */
  actorUsername: string;
  /** Исходный текст команды */
  rawCommand?: string;
  /** Текст, отображаемый в логах */
  message: string;
  /** Статус для подсветки в интерфейсе */
  status: AppLogStatus;
}

export type LogSource = typeof APP_LOG_SOURCES[keyof typeof APP_LOG_SOURCES]
