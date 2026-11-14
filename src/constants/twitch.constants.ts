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
 * Префикс команды чата в тексте сообщения.
 */
export const TWITCH_CHAT_COMMAND_PREFIX = '!'

/**
 * Префикс упоминания пользователя в аргументе команды.
 */
export const TWITCH_CHAT_MENTION_REGEX = /^@/

/**
 * Правила имени Twitch-аккаунта (канал или логин):
 * латиница, цифры и подчёркивание, от 2 до 25 символов.
 */
export const TWITCH_LOGIN_PATTERN = /^[a-z0-9_]{2,25}$/

/**
 * Имя автора для сообщений USERSTATE без display-name.
 */
export const TWITCH_CHAT_FALLBACK_AUTHOR_NAME = 'Broadcaster'

/**
 * Логин автора, когда данные сессии недоступны.
 */
export const TWITCH_CHAT_FALLBACK_LOGIN = 'broadcaster'

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
 * Количество миллисекунд в секунде.
 * Используется для перевода длительности таймаута Twitch в миллисекунды.
 */
export const TWITCH_MILLISECONDS_IN_SECOND = 1000

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
 * Тексты NOTICE Twitch об отказе авторизации IRC.
 * Сервер не присылает для них тег msg-id, поэтому они опознаются по тексту.
 *
 * @see https://dev.twitch.tv/docs/chat/irc#authenticating-with-the-twitch-irc-server
 */
export const TWITCH_AUTH_FAILURE_NOTICE_TEXTS: readonly string[] = [
  'Login authentication failed',
  'Improperly formatted auth',
]

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
 * Разделитель строк в сообщениях Twitch IRC.
 */
export const TWITCH_IRC_LINE_SEPARATOR_REGEX = /\r?\n/

/**
 * Последовательность переводов строк в тексте сообщения.
 * Используется для сплющивания текста в одну IRC-команду.
 */
export const TWITCH_IRC_LINE_BREAKS_REGEX = /[\r\n]+/g

/**
 * Чем заменяется перевод строки при сплющивании сообщения в одну команду.
 */
export const TWITCH_IRC_LINE_BREAK_REPLACEMENT = ' '

/**
 * Префикс сообщений парсера IRC в консоли.
 */
export const TWITCH_IRC_PARSER_LOG_PREFIX = '[IRC Parser]'

/**
 * Префикс сообщений IRC-клиента в консоли.
 */
export const TWITCH_IRC_CLIENT_LOG_PREFIX = '[TwitchIRC Client]'

/**
 * Тексты сообщений IRC-клиента в консоли.
 */
export const TWITCH_IRC_CLIENT_LOG_MESSAGES = {
  CHANNEL_CHANGE_ERROR: 'Ошибка в обработчике смены канала',
  CHANNEL_NOT_SET: 'Невозможно отправить сообщение: канал не задан',
  INVALID_SESSION_PARAMS: 'Подключение отклонено: некорректные параметры сессии',
  SOCKET_ERROR: 'Ошибка сокета',
} as const

/**
 * Причины недоставки сообщений в чат Twitch.
 */
export const CHAT_SEND_FAIL_REASONS = {
  NOT_INITIALIZED: 'соединение с Twitch не инициализировано',
  SOCKET_CLOSED: 'соединение с чатом закрыто',
} as const

/**
 * Тексты сообщений журнала приложения о доступе к чату Twitch.
 */
export const TWITCH_CHAT_ACCESS_LOG_MESSAGES = {
  ACTIVE_RESTRICTIONS: (restrictions: string[]): string => `Активные ограничения чата: ${restrictions.join(', ')}.`,
  AUTH_FAILED: 'Twitch отклонил авторизацию, подключение к чату невозможно.',
  BAN_INVALID_TIMEOUT: 'Аккаунт забанен (некорректный формат времени таймаута).',
  BAN_PERMANENT: 'Аккаунт перманентно забанен на канале.',
  RESTRICTION_REMOVED: 'Ограничение чата досрочно снято.',
  TIMEOUT: (duration: string): string => `Аккаунт получил таймаут на ${duration} сек.`,
  TIMEOUT_EXPIRED: 'Время таймаута истекло.',
  UNKNOWN_SEND_ERROR: (msgId?: string): string => `Неизвестная ошибка отправки сообщения Twitch (${msgId}).`,
} as const

/**
 * Ключи IRC-тегов, используемых при разборе сообщений Twitch.
 */
export const TWITCH_IRC_TAGS = {
  BADGES: 'badges',
  BAN_DURATION: 'ban-duration',
  COLOR: 'color',
  DISPLAY_NAME: 'display-name',
  ID: 'id',
  IS_ANNOUNCEMENT: 'system-type',
  IS_DELETED: 'is-deleted',
  IS_SYSTEM: 'is-system',
  MOD: 'mod',
  MOD_ACTION: 'mod-action',
  MSG_ID: 'msg-id',
  SENT_TIMESTAMP: 'tmi-sent-ts',
  SUBSCRIBER: 'subscriber',
  TARGET_MSG_ID: 'target-msg-id',
  USER_ID: 'user-id',
  USER_TYPE: 'user-type',
  VIP: 'vip',
} as const

/**
 * Параметры генерации локального ID сообщения, если Twitch не прислал тег.
 */
export const TWITCH_IRC_FALLBACK_ID = {
  RANDOM_END: 11,
  RANDOM_RADIX: 36,
  RANDOM_START: 2,
} as const

/**
 * Значения тега mod-action, описывающего действие модератора.
 */
export const TWITCH_IRC_MOD_ACTIONS = {
  BAN: 'ban',
  CLEAR_CHAT: 'clearchat',
  CLEAR_MSG: 'clearmsg',
} as const

/**
 * Значение IRC-тега, означающее истину.
 */
export const TWITCH_IRC_TAG_ENABLED = '1'

/**
 * Идентификатор сообщения, выделенного баллами канала.
 */
export const TWITCH_IRC_HIGHLIGHTED_MSG_ID = 'highlighted-message'

/**
 * Префиксы бейджей Twitch, определяющие роли аккаунта в канале.
 */
export const TWITCH_IRC_BADGE_PREFIXES = {
  BROADCASTER: 'broadcaster/',
  MODERATOR: 'moderator/',
  VIP: 'vip/',
  SUBSCRIBER: 'subscriber/',
  FOUNDER: 'founder/',
  STAFF: 'staff/',
  ADMIN: 'admin/',
} as const

/**
 * Типы пользователей Twitch, дающие права модератора.
 */
export const TWITCH_IRC_USER_TYPES = {
  STAFF: 'staff',
  ADMIN: 'admin',
} as const

/**
 * Идентификаторы параметров тегов USERNOTICE.
 */
export const TWITCH_IRC_MSG_PARAMS = {
  CUMULATIVE_MONTHS: 'msg-param-cumulative-months',
  MASS_GIFT_COUNT: 'msg-param-mass-gift-count',
  RECIPIENT_DISPLAY_NAME: 'msg-param-recipient-display-name',
  RECIPIENT_USER_NAME: 'msg-param-recipient-user-name',
  VALUE: 'msg-param-value',
  VIEWER_COUNT: 'msg-param-viewerCount',
} as const

/**
 * Параметры генерации локального ID системного сообщения.
 */
export const TWITCH_SYSTEM_MESSAGE_ID = {
  PREFIX: 'sys-',
  RANDOM_END: 9,
  RANDOM_RADIX: 36,
  RANDOM_START: 2,
} as const

/**
 * Никнейм и отображаемое имя системных сообщений.
 */
export const TWITCH_SYSTEM_MESSAGE_AUTHOR = {
  NICK: 'система',
  DISPLAY_NAME: 'Система',
} as const

/**
 * Никнейм и отображаемое имя сообщений-объявлений.
 */
export const TWITCH_ANNOUNCEMENT_AUTHOR = {
  NICK: 'объявление',
  DISPLAY_NAME: 'Объявление',
} as const

/**
 * Идентификаторы IRC-сообщений, определяющие тип системного события.
 */
export const TWITCH_IRC_MSG_IDS = {
  ANNOUNCEMENT: 'announcement',
  ANONSUBGIFT: 'anonsubgift',
  BITSBADGETIER: 'bitsbadgetier',
  RAID: 'raid',
  RESUB: 'resub',
  SUB: 'sub',
  SUBGIFT: 'subgift',
  SUBMYSTERYGIFT: 'submysterygift',
  VIEWERMILESTONE: 'viewermilestone',
} as const

/**
 * Идентификаторы NOTICE о переключении режимов комнаты.
 * Дублирующие английские уведомления игнорируются.
 */
export const TWITCH_ROOM_STATE_NOTICE_IDS: readonly string[] = [
  'room_subs_on', 'room_subs_off',
  'room_emoteonly_on', 'room_emoteonly_off',
  'msg_emote_only', 'msg_emote_only_off',
  'room_r9k_on', 'room_r9k_off',
  'msg_r9k_on', 'msg_r9k_off',
  'followers_on', 'followers_off',
  'msg_followers_on', 'msg_followers_off',
  'slow_on', 'slow_off',
  'msg_slow_on', 'msg_slow_off',
] as const

/**
 * Английские тексты NOTICE о переключении режимов комнаты.
 * Используются как резервный фильтр при пустом msg-id.
 */
export const TWITCH_ROOM_STATE_NOTICE_TEXTS = [
  'This room is now in emote-only mode',
  'This room is no longer in emote-only mode',
  'This room is now in subscribers-only mode',
  'This room is no longer in subscribers-only mode',
  'This room is now in followers-only mode',
  'This room is no longer in followers-only mode',
  'This room is now in slow mode',
  'This room is no longer in slow mode',
] as const

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
