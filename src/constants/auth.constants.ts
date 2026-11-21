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
 * Результаты проверки OAuth-параметра `state`.
 */
export const AUTH_STATE_VALIDATION_RESULTS = {
  VALID: 'valid',
  INVALID: 'invalid',
  EXPIRED: 'expired',
  UNAVAILABLE: 'unavailable',
} as const

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
 * Тексты ошибок и сообщений авторизации.
 */
export const TWITCH_AUTH_UI_MESSAGES = {
  CSRF_FAILED: 'Ошибка безопасности (CSRF): верификация контекста не пройдена.',
  DENIED: 'Авторизация отклонена Twitch:',
  AUTH_CANCELLED: 'Авторизация отменена: ответ Twitch не получен.',
  URL_BUILD_FAILED: 'Ошибка при формировании URL авторизации.',
  CLIENT_ID_MISSING: 'Twitch Client ID не найден в конфигурации приложения. Проверьте настройки CI/CD.',
  INIT_FAILED: 'Не удалось обработать ответ Twitch. Попробуйте войти снова.',
  UNKNOWN_AUTH: 'Неизвестная ошибка при авторизации.',
  AUTH_STATE_UNAVAILABLE: 'Браузер блокирует хранилище, поэтому не удалось проверить состояние авторизации. Разрешите хранение данных сайта и попробуйте снова.',
  AUTH_STATE_EXPIRED: 'Время ожидания авторизации истекло. Попробуйте войти снова.',
  STORAGE_PERSISTENCE_UNAVAILABLE: 'Браузер ограничивает хранилище: часть данных и настроек не сохранится после перезагрузки.',
  UNKNOWN_VALIDATION: 'Неизвестная ошибка валидации токена.',
  VALIDATION_UNAVAILABLE: 'Не удалось проверить токен: Twitch недоступен. Проверьте соединение и попробуйте снова.',
  VALIDATION_FAILED: 'Не удалось подтвердить валидность токена через Twitch API.',
  SESSION_NOT_FOUND: 'Сессия не найдена.',
  SESSION_EXPIRED: 'Сессия Twitch истекла или была отозвана. Войдите снова — канал и настройки сохранены.',
}

/**
 * Тексты модального окна авторизации.
 */
export const TWITCH_AUTH_MODAL_UI_MESSAGES = {
  VALIDATING_TITLE: 'Проверка токена',
  VALIDATING_DESCRIPTION: 'Верифицируем вашу сессию через официальный API Twitch...',
  SUCCESS_TITLE: 'Успешный вход!',
  SUCCESS_DESCRIPTION: 'Добро пожаловать. Окно закроется автоматически.',
  ERROR_TITLE: 'Ошибка входа',
  RETRY: 'Повторить',
  CLOSE: 'Закрыть',
} as const

/**
 * Тексты модального окна подтверждения выхода из аккаунта.
 */
export const TWITCH_LOGOUT_UI_MESSAGES = {
  TITLE: 'Выйти из аккаунта?',
  DESCRIPTION: 'Бот отключится от канала. Выбранный канал и настройки сохранятся.',
  CONFIRM: 'Выйти',
  CANCEL: 'Отмена',
} as const

/**
 * Статусы проверки OAuth-токена.
 */
export const TWITCH_TOKEN_VALIDATION_STATUSES = {
  VALID: 'valid',
  INVALID: 'invalid',
  UNAVAILABLE: 'unavailable',
} as const

/**
 * HTTP-статус, которым Twitch сообщает о недействительном токене.
 */
export const TWITCH_UNAUTHORIZED_STATUS = 401

/**
 * HTTP-статусы, при которых Twitch отклоняет переданный токен.
 */
export const TWITCH_TOKEN_REJECTED_STATUSES: readonly number[] = [400, TWITCH_UNAUTHORIZED_STATUS]

/**
 * Тексты ошибок сессии и инициализации авторизации.
 */
export const TWITCH_SESSION_ERRORS = {
  CORRUPTED: 'Повреждённая сессия Twitch удалена из хранилища.',
  INIT_FAILED: 'Не удалось инициализировать авторизацию Twitch:',
  REDIRECT_CLEANUP_FAILED: 'Не удалось очистить OAuth-параметры из адресной строки:',
} as const

/**
 * Хранилище, в котором лежит попытка входа.
 */
export const TWITCH_AUTH_STATE_STORAGE_KIND = 'sessionStorage'

/**
 * Ключ хранилища для попытки входа (`state`), защищающей OAuth-поток от CSRF.
 */
export const TWITCH_AUTH_STATE_STORAGE_KEY = 'twitch_oauth_state'

/**
 * Этапы процесса авторизации.
 */
export const TWITCH_AUTH_STAGES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  SUCCESS: 'success',
  ERROR: 'error',
}

/**
 * Интервал фоновой проверки токена (45 минут).
 */
export const TWITCH_TOKEN_VALIDATION_INTERVAL_MS = 45 * 60 * 1000

/**
 * Срок жизни попытки входа (10 минут).
 *
 * После истечения срока `state` считается просроченным и больше не принимается.
 */
export const TWITCH_AUTH_STATE_TTL_MS = 10 * 60 * 1000

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
 * Статусы проверки канала через Twitch Helix.
 */
export const TWITCH_CHANNEL_PROFILE_STATUSES = {
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  UNAVAILABLE: 'unavailable',
  UNAUTHORIZED: 'unauthorized',
} as const

/**
 * Тексты ошибок валидации имени Twitch-канала.
 */
export const TWITCH_CHANNEL_ERRORS = {
  EMPTY: 'Имя канала не может быть пустым.',
  INVALID: 'Некорректное имя канала Twitch.',
  NOT_FOUND: 'Канал не найден на Twitch.',
  STORED_INVALID: 'Выбранный канал недействителен. Выберите канал заново.',
  UNAVAILABLE: 'Не удалось проверить канал: Twitch недоступен. Проверьте соединение и попробуйте снова.',
} as const

/**
 * Сообщения журнала при получении профиля канала.
 */
export const TWITCH_CHANNEL_PROFILE_LOG_MESSAGES = {
  HTTP_ERROR: (status: number): string => `Ошибка получения профиля канала Twitch: HTTP ${status}`,
  NETWORK_ERROR: 'Ошибка сети при получении профиля канала:',
} as const
