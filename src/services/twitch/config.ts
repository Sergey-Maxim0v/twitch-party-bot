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
