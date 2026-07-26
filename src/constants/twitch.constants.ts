export const TWITCH_CHAT_MAX_LENGTH = 500;
export const TWITCH_CHAT_MIN_LENGTH = 1;

// Статусы WebSocket соединения с IRC сервером Twitch
export const TwitchConnectionStatus = {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    ERROR: 'ERROR'
} as const;

export type TwitchConnectionStatusType = typeof TwitchConnectionStatus[keyof typeof TwitchConnectionStatus];

// Дефолтный бренд-цвет Twitch
export const TWITCH_DEFAULT_COLOR = '#9146FF';

// Типы сетевых и протокольных ошибок
export const TwitchErrorType = {
    CONNECTION_FAILED: 'CONNECTION_FAILED', // Не удалось установить соединение (нет сети)
    AUTH_FAILED: 'AUTH_FAILED',             // Ошибка авторизации (невалидный OAuth токен)
    UNKNOWN: 'UNKNOWN'                      // Непредвиденная рантайм ошибка
} as const;

export type TwitchErrorTypeValues = typeof TwitchErrorType[keyof typeof TwitchErrorType];

// Стандартные коды закрытия WebSocket по спецификации RFC 6455
export const WS_CLOSE_NORMAL = 1000;