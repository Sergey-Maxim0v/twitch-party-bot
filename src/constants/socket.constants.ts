/**
 * Статусы соединения с IRC-сокетом Twitch.
 */
export const SOCKET_CONNECTION_STATUSES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
}

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
 * Результаты попытки подключения к IRC-сокету Twitch.
 */
export const TWITCH_CONNECT_OUTCOMES = {
  RECONNECTED: 'reconnected',
  ALREADY_CONNECTED: 'already-connected',
  IGNORED: 'ignored',
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
 * Префикс сообщений менеджера сокета в консоли.
 */
export const SOCKET_LOG_PREFIX = '[SocketLifecycleManager]'

/**
 * Тексты сообщений менеджера жизненного цикла сокета.
 */
export const SOCKET_LOG_MESSAGES = {
  CLOSE_FAILED: 'Ошибка при закрытии сокета',
  SEND_FAILED: 'Ошибка отправки данных',
  SEND_SKIPPED: 'Отправка пропущена: сокет не открыт',
} as const
