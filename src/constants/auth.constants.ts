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
 * Тип сообщения, которое popup отправляет родительскому окну.
 */
export const TWITCH_AUTH_MESSAGE_TYPE = 'TWITCH_AUTH_RESULT'

/**
 * Имена параметров URL, которые Twitch возвращает после редиректа.
 */
export const TWITCH_AUTH_URL_PARAMS = {
  ACCESS_TOKEN: 'access_token',
  ERROR: 'error',
  ERROR_DESCRIPTION: 'error_description',
  STATE: 'state',
} as const

/**
 * Тексты ошибок процесса авторизации.
 */
export const TWITCH_AUTH_UI_MESSAGES = {
  CSRF_FAILED: 'Ошибка безопасности (CSRF): верификация контекста не пройдена.',
  DENIED: 'Авторизация отклонена Twitch:',
  POPUP_BLOCKED: 'Всплывающее окно заблокировано браузером. Войдите в текущей вкладке.',
  POPUP_CLOSED: 'Авторизация отменена: всплывающее окно было закрыто.',
  POPUP_TIMEOUT: 'Авторизация не завершена вовремя. Попробуйте снова.',
  URL_BUILD_FAILED: 'Ошибка при формировании URL авторизации.',
  UNKNOWN_VALIDATION: 'Неизвестная ошибка валидации токена.',
  VALIDATION_UNAVAILABLE: 'Не удалось проверить токен: Twitch недоступен. Проверьте соединение и попробуйте снова.',
  VALIDATION_FAILED: 'Не удалось подтвердить валидность токена через Twitch API.',
  SESSION_NOT_FOUND: 'Сессия не найдена.',
}

/**
 * Статусы проверки OAuth-токена.
 */
export const TWITCH_TOKEN_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  UNAVAILABLE: 'unavailable',
} as const

/**
 * HTTP-статусы, при которых Twitch отклоняет переданный токен.
 */
export const TWITCH_TOKEN_REJECTED_STATUSES: readonly number[] = [400, 401]

/**
 * Тексты ошибок сессии и инициализации авторизации.
 */
export const TWITCH_SESSION_ERRORS = {
  CORRUPTED: 'Повреждённая сессия Twitch удалена из хранилища.',
  INIT_FAILED: 'Не удалось инициализировать авторизацию Twitch:',
} as const

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
 * Таймаут запроса проверки токена (10 секунд).
 *
 * Без него «зависший» ответ Twitch навсегда блокирует авторизацию.
 */
export const TWITCH_TOKEN_VALIDATION_TIMEOUT_MS = 10 * 1000

/**
 * Задержка закрытия модального окна после успешной авторизации.
 */
export const TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS = 1000

/**
 * Интервал проверки ручного закрытия popup-окна.
 */
export const TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS = 500

/**
 * Таймаут ожидания завершения авторизации во всплывающем окне (5 минут).
 */
export const TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS = 5 * 60 * 1000

/**
 * Имя, размеры и возможности окна Twitch-авторизации.
 */
export const TWITCH_AUTH_POPUP = {
  NAME: 'TwitchAuthPopup',
  WIDTH: 500,
  HEIGHT: 650,
  FEATURES: 'scrollbars=yes,resizable=yes',
}

/**
 * Тексты ошибок валидации имени Twitch-канала.
 */
export const TWITCH_CHANNEL_ERRORS = {
  EMPTY: 'Имя канала не может быть пустым.',
  INVALID: 'Некорректное имя канала Twitch.',
  NOT_FOUND: 'Канал не найден на Twitch.',
} as const
