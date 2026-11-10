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
