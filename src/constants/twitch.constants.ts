export const TWITCH_HELIX_BASE_URL = 'https://api.twitch.tv/helix'

export const TWITCH_IRC_SOCKET_URL = 'wss://irc-ws.chat.twitch.tv:443'

export const TWITCH_CHAT_MESSAGE_MAX_LENGTH = 500

export const TWITCH_CHAT_MESSAGE_MIN_LENGTH = 1

/**
 * Безопасный лимит длины сообщения бота для Twitch PRIVMSG.
 */
export const TWITCH_CHAT_MESSAGE_SAFE_MAX_LENGTH = 400

/**
 * Лимит сообщений в истории чата.
 */
export const TWITCH_CHAT_HISTORY_MAX_MESSAGES = 300

/**
 * Интервал отправки PING для контроля «полуоткрытого» соединения.
 */
export const TWITCH_HEARTBEAT_INTERVAL_MS = 60000

/**
 * Время ожидания ответа PONG перед принудительным переподключением.
 */
export const TWITCH_PONG_TIMEOUT_MS = 10000

export const TWITCH_PONG_MESSAGE = 'PONG :tmi.twitch.tv'

/**
 * @see https://dev.twitch.tv/docs/chat/irc#irc-command-reference
 */
export const TWITCH_IRC_COMMANDS = {
  CLEAR_CHAT: 'CLEARCHAT',
  CLEAR_MSG: 'CLEARMSG',
  GLOBAL_USER_STATE: 'GLOBALUSERSTATE',
  NOTICE: 'NOTICE',
  PART: 'PART',
  PING: 'PING',
  PONG: 'PONG',
  PRIV_MSG: 'PRIVMSG',
  RECONNECT: 'RECONNECT',
  ROOM_STATE: 'ROOMSTATE',
  USER_NOTICE: 'USERNOTICE',
  USER_STATE: 'USERSTATE',
  JOIN: 'JOIN',
  MOTD_START: '375', // Сигнал начала приветствия сервера
} as const

/**
 * Дополнительные возможности (Capabilities) Twitch IRC сокета.
 * @see https://dev.twitch.tv/docs/chat/irc#twitch-irc-membership-commands
 */
export const TWITCH_IRC_CAPABILITIES = {
  MEMBERSHIP: 'twitch.tv/membership',
  TAGS: 'twitch.tv/tags',
  COMMANDS: 'twitch.tv/commands',
} as const

/**
 * Команды управления, отправляемые из основного потока React в Web Worker.
 */
export const TWITCH_HEARTBEAT_WORKER_COMMANDS = {
  START_PING_TIMER: 'START_PING_TIMER',
  START_PONG_TIMER: 'START_PONG_TIMER',
  CLEAR_PONG_TIMER: 'CLEAR_PONG_TIMER',
  CLEAR_ALL: 'CLEAR_ALL',
} as const

/**
 * События сетевой активности, возвращаемые из Web Worker в основной поток React.
 */
export const TWITCH_HEARTBEAT_WORKER_EVENTS = {
  PING_TICK: 'PING_TICK',
  PONG_TIMEOUT: 'PONG_TIMEOUT',
}
