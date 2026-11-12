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
 * Префикс сообщений менеджера сокета в консоли.
 */
export const SOCKET_LOG_PREFIX = '[SocketLifecycleManager]'
