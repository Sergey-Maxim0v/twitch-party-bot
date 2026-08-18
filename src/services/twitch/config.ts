export const TWITCH_SOCKET_BASE_URL = 'wss://irc-ws.chat.twitch.tv:443'

/**
 * Лимит сообщений в истории чата
 */
export const MAX_MESSAGES = 100;

/**
 * @see https://dev.twitch.tv/docs/chat/irc#irc-command-reference
 */
export const TwitchIrcCommand = {
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
} as const;

export type TwitchIrcCommandType = typeof TwitchIrcCommand[keyof typeof TwitchIrcCommand];

/**
 * Дополнительные возможности (Capabilities) Twitch IRC сокета.
 * @see https://dev.twitch.tv/docs/chat/irc#twitch-irc-membership-commands
 */
export const TwitchIrcCapability = {
    MEMBERSHIP: 'twitch.tv/membership',
    TAGS: 'twitch.tv/tags',
    COMMANDS: 'twitch.tv/commands',
} as const;

export type TwitchIrcCapabilityType = typeof TwitchIrcCapability[keyof typeof TwitchIrcCapability];

/**
 * Команды управления, отправляемые из основного потока React в Web Worker
 */
export const HeartbeatWorkerCommand = {
    START_PING_TIMER: 'START_PING_TIMER',
    START_PONG_TIMER: 'START_PONG_TIMER',
    CLEAR_PONG_TIMER: 'CLEAR_PONG_TIMER',
    CLEAR_ALL: 'CLEAR_ALL',
} as const;

export type HeartbeatWorkerCommandType = typeof HeartbeatWorkerCommand[keyof typeof HeartbeatWorkerCommand];

/**
 * События сетевой активности, возвращаемые из Web Worker в основной поток React
 */
export const HeartbeatWorkerEvent = {
    PING_TICK: 'PING_TICK',
    PONG_TIMEOUT: 'PONG_TIMEOUT',
} as const;

export type HeartbeatWorkerEventType = typeof HeartbeatWorkerEvent[keyof typeof HeartbeatWorkerEvent];
