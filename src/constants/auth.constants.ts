/**
 * Идентификатор клиента Twitch OAuth-приложения.
 *
 * @see {@link https://dev.twitch.tv/docs/authentication/register-app}
 */
export const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID

/**
 * Базовый URL OAuth-сервиса Twitch.
 */
export const TWITCH_AUTH_BASE_URL = 'https://id.twitch.tv/oauth2'

/**
 * URL возврата на приложение после прохождения авторизации.
 */
export const TWITCH_AUTH_REDIRECT_URI = window.location.origin + window.location.pathname

/**
 * Области доступа, запрашиваемые у Twitch.
 *
 * @see {@link https://dev.twitch.tv/docs/authentication/scopes/#irc-chat-scopes}
 */
export const TWITCH_AUTH_SCOPES = {
  READ_CHAT: 'chat:read',
  WRITE_CHAT: 'chat:edit',
}

/**
 * Коды ошибок, возвращаемые сервером авторизации Twitch.
 */
export const TWITCH_AUTH_ERRORS = {
  CSRF_FAILED: 'CSRF_VALIDATION_FAILED',
}

/**
 * Ключ sessionStorage для хранения `state`, защищающего OAuth-поток от CSRF.
 */
export const TWITCH_AUTH_STATE_STORAGE_KEY = 'twitch_oauth_state'

/**
 * Этапы процесса авторизации.
 */
export const TWITCH_AUTH_STAGES = {
  IDLE: 'idle',
  WAITING: 'waiting',
  VALIDATING: 'validating',
  SUCCESS: 'success',
  ERROR: 'error',
}

/**
 * Интервал фоновой проверки токена (45 минут).
 */
export const TWITCH_TOKEN_VALIDATION_INTERVAL_MS = 45 * 60 * 1000

/**
 * Тексты ошибок валидации имени Twitch-канала.
 */
export const TWITCH_CHANNEL_ERRORS = {
  EMPTY: 'Имя канала не может быть пустым.',
  INVALID: 'Некорректное имя канала Twitch.',
  NOT_FOUND: 'Канал не найден на Twitch.',
} as const
