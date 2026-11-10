/**
 * Статусы записей журнала приложения.
 */
export const APP_LOG_STATUSES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

/**
 * Источники инициации действий для журнала приложения.
 */
export const APP_LOG_SOURCES = {
  /** Пользователь приложения. */
  STREAMER_UI: 'streamer_ui',
  /** Модератор командой в чате. */
  CHAT_MODERATOR: 'chat_moderator',
  /** Участник чата. */
  CHAT_USER: 'chat_user',
  /** Система. */
  APPLICATION: 'application',
}
