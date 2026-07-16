/**
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 */

import {TWITCH_AUTH_BASE_URL, TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI, TWITCH_SCOPES} from './config';

export interface TwitchAuthError {
    error: string;
    description: string;
}

// Ключ для хранения state в sessionStorage
const STATE_KEY = 'twitch_oauth_state';

/**
 * Генерирует случайную безопасную строку для параметра state
 */
const generateRandomState = (): string => {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
};

/**
 * Проверяет валидность вернувшегося параметра state
 */
const isValidState = (receivedState: string | null): boolean => {
    const savedState = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);

    return !(!savedState || !receivedState || savedState !== receivedState);
};

/**
 * Генерирует ссылку для перенаправления пользователя на Twitch с защитой state
 */
export const getTwitchAuthUrl = (): string => {
    const state = generateRandomState();
    sessionStorage.setItem(STATE_KEY, state);

    const scopesString = `${TWITCH_SCOPES.READ_CHAT} ${TWITCH_SCOPES.WRITE_CHAT}`;

    return TWITCH_AUTH_BASE_URL + `/authorize` +
        `?client_id=${TWITCH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(scopesString)}` +
        `&state=${state}`;
};

/**
 * Извлекает токен доступа из хэша URL после возвращения от Twitch с проверкой state
 */
export const extractTwitchToken = (): { token: string | null; error: string | null } => {
    const hash = window.location.hash;
    if (!hash) return {token: null, error: null};

    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    const state = params.get('state');

    window.history.replaceState({}, document.title, window.location.pathname);

    if (token) {
        if (!isValidState(state)) {
            return {token: null, error: 'CSRF_VALIDATION_FAILED'};
        }
        return {token, error: null};
    }

    return {token: null, error: null};
};

/**
 * Проверяет наличие ошибок авторизации в query-параметрах URL с проверкой state
 */
export const checkAuthError = (): TwitchAuthError | null => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
        const description = searchParams.get('error_description') || 'Произошла ошибка при авторизации';

        window.history.replaceState({}, document.title, window.location.pathname);

        if (!isValidState(state)) {
            return {
                error: 'CSRF_VALIDATION_FAILED',
                description: 'Ошибка безопасности: запрос авторизации был подделан.'
            };
        }

        return {
            error,
            description: decodeURIComponent(description.replace(/\+/g, ' '))
        };
    }

    return null;
};
