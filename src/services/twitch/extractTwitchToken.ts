import {isValidState} from "./crypto.ts";

/**
 * Извлекает токен доступа из хэша URL после возвращения от Twitch с проверкой state
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 * */
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
