import {isValidState} from "./crypto.ts";
import type {TwitchAuthMessageData} from "./types/messages.types.ts";
import {TWITCH_AUTH_ERRORS} from "./config.ts";

export interface TwitchHashData {
    token: string | null;
    error: string | null;
}

/**
 * Извлекает токен или ошибку из URL.
 * Если код выполняется внутри всплывающего окна (Popup),
 * он пересылает результат главному окну и закрывает себя.
 *
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 */
export const extractTwitchToken = (): TwitchHashData => {
    const hash = window.location.hash;
    const search = window.location.search;

    let token: string | null = null;
    let error: string | null = null;

    // 1. Извлечение ошибки авторизации из параметров запроса (Query Parameters)
    if (search) {
        const searchParams = new URLSearchParams(search);
        const errorType = searchParams.get('error');
        const errorDesc = searchParams.get('error_description');
        if (errorType) {
            error = errorDesc || errorType;
        }
    }

    // 2. Извлечение токена доступа из параметров хэша (URL Hash)
    if (hash && !error) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const state = hashParams.get('state');

        if (accessToken) {
            if (isValidState(state)) {
                token = accessToken;
            } else {
                error = TWITCH_AUTH_ERRORS.CSRF_FAILED;
            }
        }
    }

    // Проверка контекста выполнения: открыто ли текущее окно как всплывающее (Popup)
    const isPopup = window.opener && window.opener !== window;

    if (isPopup && (token || error)) {
        const messagePayload: TwitchAuthMessageData = {
            type: 'TWITCH_AUTH_RESULT',
            token,
            error,
        };

        // Передача результатов авторизации в родительское окно приложения
        window.opener.postMessage(
            messagePayload,
            window.location.origin
        );

        // Закрытие контекста всплывающего окна
        window.close();
    }

    // Очистка параметров URL в контексте главного окна приложения
    if (!isPopup && (hash || search)) {
        window.history.replaceState(null, '', window.location.pathname);
    }

    return {token, error};
};