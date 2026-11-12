/**
 * Статусы соединения с IRC-сокетом Twitch.
 */
export const SOCKET_CONNECTION_STATUSES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
} as const

/**
 * Статусы доступа к чату Twitch.
 */
export const TWITCH_CHAT_ACCESS_STATUSES = {
  OFFLINE: 'offline',
  CONNECTED: 'connected',
  RESTRICTED: 'restricted',
  BANNED: 'banned',
}

/**
 * Причины терминального отказа соединения.
 */
export const SOCKET_FAILURE_REASONS = {
  /** Twitch отклонил авторизацию. */
  AUTH: 'auth',
  /** Исчерпан лимит попыток переподключения. */
  LIMIT: 'limit',
} as const

/**
 * Результаты попытки подключения к IRC-сокету Twitch.
 */
export const TWITCH_CONNECT_OUTCOMES = {
  RECONNECTED: 'reconnected',
  ALREADY_CONNECTED: 'already-connected',
  IGNORED: 'ignored',
} as const

/**
 * Результаты запуска автоматического переподключения.
 */
export const RECONNECT_OUTCOMES = {
  /** Попытка переподключения запланирована. */
  SCHEDULED: 'scheduled',
  /** Исчерпан лимит попыток переподключения. */
  LIMIT_REACHED: 'limit-reached',
  /** Переподключение не требуется. */
  SKIPPED: 'skipped',
} as const

/**
 * Тайм-аут сторожа статуса соединения.
 */
export const SOCKET_STATUS_WATCHDOG_TIMEOUT_MS = 5 * 1000

/**
 * Максимальное количество автоматических попыток переподключения.
 */
export const SOCKET_RECONNECT_MAX_ATTEMPTS = 5

/**
 * Время жизни соединения, после которого попытка считается успешной.
 */
export const SOCKET_STABLE_CONNECTION_MS = 30 * 1000

/**
 * Префикс сообщений менеджера сокета в консоли.
 */
export const SOCKET_LOG_PREFIX = '[SocketLifecycleManager]'

/**
 * Префикс сообщений менеджера переподключения в консоли.
 */
export const SOCKET_RECONNECT_LOG_PREFIX = '[TwitchReconnectManager]'

/**
 * Тексты сообщений менеджера жизненного цикла сокета.
 */
export const SOCKET_LOG_MESSAGES = {
  CLOSE_FAILED: 'Ошибка при закрытии сокета',
  SEND_FAILED: 'Ошибка отправки данных',
  SEND_SKIPPED: 'Отправка пропущена: сокет не открыт',
} as const

/**
 * Тексты сообщений менеджера переподключения.
 */
export const SOCKET_RECONNECT_LOG_MESSAGES = {
  SESSION_PARAMS_MISSING: 'Подключение невозможно: отсутствуют параметры сессии',
} as const

/**
 * Тексты журнала приложения о терминальном отказе соединения.
 */
export const SOCKET_FAILURE_LOG_MESSAGES = {
  AUTH: 'Twitch отклонил авторизацию: токен недействителен. Требуется повторный вход.',
  LIMIT: (attempts: number): string => `Превышен лимит попыток подключения (${attempts}). Автоматическое восстановление остановлено.`,
} as const
