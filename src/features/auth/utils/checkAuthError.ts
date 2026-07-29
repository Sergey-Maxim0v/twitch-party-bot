import {isValidState} from "./crypto.ts";

export interface TwitchAuthError {
    error: string;
    description: string;
}

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
