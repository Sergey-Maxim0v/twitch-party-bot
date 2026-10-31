export const TWITCH_AUTH_BASE_URL = 'https://id.twitch.tv/oauth2'

/**
 * @see {@link  https://dev.twitch.tv/docs/authentication/register-app}
 */
export const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID

export const TWITCH_REDIRECT_URI = window.location.origin + window.location.pathname

/**
 * @see{@link https://dev.twitch.tv/docs/authentication/scopes/#irc-chat-scopes}
 */
export const TWITCH_SCOPES = {
  READ_CHAT: 'chat:read',
  WRITE_CHAT: 'chat:edit',
}

export const TWITCH_AUTH_ERRORS = {
  CSRF_FAILED: 'CSRF_VALIDATION_FAILED',
} as const

export const TWITCH_STORAGE_KEYS = {
  SESSION: 'tqp_twitch_session',
  ACTIVE_CHANNEL: 'tqp_active_channel',
}
