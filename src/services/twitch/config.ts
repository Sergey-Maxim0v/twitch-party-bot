export const TWITCH_HELIX_BASE_URL = 'https://twitch.tv';
export const TWITCH_AUTH_BASE_URL = 'https://id.twitch.tv/oauth2';

/**
 * @see {@link  https://dev.twitch.tv/docs/authentication/register-app}
 */
export const TWITCH_CLIENT_ID = '13wnz7xzae0v5q4ohlh4kbv5dwh08i';

export const TWITCH_REDIRECT_URI = window.location.origin + window.location.pathname;

/**
 * @see{@link https://dev.twitch.tv/docs/authentication/scopes/}
 */
export const TWITCH_SCOPES = {
    READ_CHAT: 'user:read:chat',
    WRITE_CHAT: 'user:write:chat'
}

export const TWITCH_AUTH_ERRORS = {
    CSRF_FAILED: 'CSRF_VALIDATION_FAILED',
} as const;

export const TWITCH_STORAGE_KEYS = {
    SESSION: 'tqp_twitch_session',
    ACTIVE_CHANNEL: 'tqp_active_channel',
};

// Команды протокола Twitch IRC для поддержания соединения (Keep-Alive)
export const TWITCH_IRC_PING = 'PING';
export const TWITCH_IRC_PONG = 'PONG :tmi.twitch.tv';

// Команда протокола Twitch IRC для пользовательских текстовых сообщений
export const TWITCH_IRC_PRIVMSG = 'PRIVMSG';

// Системное сообщение Twitch IRC при ошибке авторизации
export const TWITCH_AUTH_FAILED_NOTICE = 'Login authentication failed';

// Системная команда уведомлений протокола IRC
export const TWITCH_IRC_NOTICE = 'NOTICE';

// Настройки автоматического переподключения (Auto-Reconnect)
export const TWITCH_RECONNECT_MAX_ATTEMPTS = 5; // Максимальное количество попыток
export const TWITCH_RECONNECT_DELAY_MS = 3000;  // Задержка между попытками (3 секунды)

// Код протокола IRC, означающий успешное завершение подключения к каналу
export const TWITCH_IRC_READY_CODE = '366';

// Максимальное количество сообщений, хранимых в стейте чата одновременно
export const TWITCH_CHAT_MAX_MESSAGES = 100;

// Команда протокола Twitch IRC для полной очистки чата или бана пользователя
export const TWITCH_IRC_CLEARCHAT = 'CLEARCHAT';
