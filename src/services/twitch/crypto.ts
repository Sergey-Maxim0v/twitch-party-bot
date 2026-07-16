const STATE_KEY = 'twitch_oauth_state';

/**
 * Генерирует случайную безопасную строку для параметра state.
 */
export const generateRandomState = (): string => {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
};

/**
 * Записывает state в сессию браузера.
 */
export const saveAuthState = (state: string): void => {
    sessionStorage.setItem(STATE_KEY, state);
};

/**
 * Проверяет валидность вернувшегося параметра state и очищает сессию.
 */
export const isValidState = (receivedState: string | null): boolean => {
    const savedState = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);

    return !(!savedState || !receivedState || savedState !== receivedState);
};
