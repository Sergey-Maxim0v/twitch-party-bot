export const APP_LOG_STATUSES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

/**
 * Источник инициации действий для логирования.
 */
export const APP_LOG_SOURCES = {
  STREAMER_UI: 'streamer_ui', // пользователь приложения
  CHAT_MODERATOR: 'chat_moderator', // модератор командой в чате
  CHAT_USER: 'chat_user', // участник чата
  APPLICATION: 'application', // система
}
