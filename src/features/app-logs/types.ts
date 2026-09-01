export const APP_LOG_STATUSES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

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

/**
 * Источник инициации действий для логирования
 */
export const LOG_SOURCE = {
  STREAMER_UI: 'streamer_ui',
  CHAT_MODERATOR: 'chat_moderator',
  CHAT_USER: 'chat_user',
  APPLICATION: 'application',
} as const

export type LogSource = typeof LOG_SOURCE[keyof typeof LOG_SOURCE]
