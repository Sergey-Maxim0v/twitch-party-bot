/**
 * Базовый URL Twitch Helix API.
 */
export const TWITCH_HELIX_BASE_URL = 'https://api.twitch.tv/helix'

/**
 * URL IRC-сокета Twitch.
 */
export const TWITCH_IRC_SOCKET_URL = 'wss://irc-ws.chat.twitch.tv:443'

/**
 * Максимальная длина сообщения в чате Twitch.
 */
export const TWITCH_CHAT_MESSAGE_MAX_LENGTH = 500

/**
 * Минимальная длина сообщения в чате Twitch.
 */
export const TWITCH_CHAT_MESSAGE_MIN_LENGTH = 1

/** Безопасный лимит длины текстового сообщения для Twitch PRIVMSG. */
export const TWITCH_CHAT_MESSAGE_SAFE_MAX_LENGTH = 400

/**
 * Лимит сообщений в истории чата.
 */
export const TWITCH_CHAT_HISTORY_MAX_MESSAGES = 300

/**
 * Префикс имени канала в IRC.
 */
export const TWITCH_CHAT_CHANNEL_PREFIX = '#'

/**
 * Имя автора для сообщений USERSTATE без display-name.
 */
export const TWITCH_CHAT_FALLBACK_AUTHOR_NAME = 'Broadcaster'

/**
 * Параметры генерации локального ID сообщения чата.
 */
export const TWITCH_CHAT_MESSAGE_ID = {
  PREFIX: 'msg-',
  RANDOM_END: 5,
  RANDOM_RADIX: 36,
  RANDOM_START: 2,
} as const

/**
 * Задержка создания сокета после смены канала.
 */
export const TWITCH_SOCKET_CONNECT_DELAY_MS = 16

/**
 * Интервал отправки PING для контроля «полуоткрытого» соединения.
 */
export const TWITCH_HEARTBEAT_INTERVAL_MS = 60 * 1000

/**
 * Время ожидания ответа PONG перед принудительным переподключением.
 */
export const TWITCH_PONG_TIMEOUT_MS = 10 * 1000

/**
 * Ответ на PING сервера Twitch.
 */
export const TWITCH_PONG_MESSAGE = 'PONG :tmi.twitch.tv'

/**
 * Запрос PING для контроля «полуоткрытого» соединения.
 */
export const TWITCH_PING_MESSAGE = 'PING :twitch_party_queue'

/**
 * Команды протокола Twitch IRC.
 *
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
  /** Сигнал начала приветствия сервера. */
  MOTD_START: '375',
} as const

/**
 * Дополнительные возможности (Capabilities) Twitch IRC сокета.
 *
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
} as const

/**
 * Теги состояния комнаты, приходящие в команде ROOMSTATE.
 */
export const TWITCH_ROOM_STATE_TAGS = {
  SUBS_ONLY: 'subs-only',
  EMOTE_ONLY: 'emote-only',
  FOLLOWERS_ONLY: 'followers-only',
  SLOW: 'slow',
  R9K: 'r9k',
} as const

/**
 * Ключи IRC-тегов, используемых при разборе сообщений Twitch.
 */
export const TWITCH_IRC_TAGS = {
  MSG_ID: 'msg-id',
  BAN_DURATION: 'ban-duration',
  DISPLAY_NAME: 'display-name',
  IS_SYSTEM: 'is-system',
  IS_DELETED: 'is-deleted',
  IS_ANNOUNCEMENT: 'system-type',
} as const

/**
 * Системные сообщения о режимах ограничения доступа к чату Twitch.
 */
export const TWITCH_ROOM_STATE_MESSAGES = {
  SUBS_ONLY_ENABLED: 'Включен режим "Только для подписчиков".',
  SUBS_ONLY_DISABLED: 'Режим "Только для подписчиков" отключен.',
  EMOTE_ONLY_ENABLED: 'Включен режим "Только смайлы".',
  EMOTE_ONLY_DISABLED: 'Режим "Только смайлы" отключен.',
  FOLLOWERS_ONLY_ENABLED: (minutes: number): string => minutes === 0
    ? 'Включен режим "Только для фолловеров".'
    : `Включен режим "Только для фолловеров" (минимум ${minutes} мин.).`,
  FOLLOWERS_ONLY_DISABLED: 'Режим "Только для фолловеров" отключен.',
  SLOW_ENABLED: (seconds: string): string => `Включен медленный режим (${seconds} сек.).`,
  SLOW_DISABLED: 'Медленный режим отключен.',
  R9K_ENABLED: 'Включен режим уникальных сообщений.',
  R9K_DISABLED: 'Режим уникальных сообщений отключен.',
} as const
