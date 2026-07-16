import {TWITCH_AUTH_BASE_URL} from "./config.ts";

export interface TwitchUserData {
    userId: string;
    login: string;
}

/**
 * Отправляет запрос на сервера Twitch для проверки активности токена.
 *
 * @param {string} token - Проверяемый токен доступа OAuth.
 * @returns {Promise<TwitchUserData | null>} Данные пользователя при успехе, или null при невалидном токене.
 * @see {@link https://dev.twitch.tv/docs/authentication/validate-tokens}
 */
export const validateTwitchToken = async (token: string): Promise<TwitchUserData | null> => {
    try {
        const response: Response = await fetch(TWITCH_AUTH_BASE_URL + '/validate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 401) {
            return null;
        }

        const data = await response.json();
        return {
            userId: data.user_id,
            login: data.login,
        };
    } catch (error) {
        console.error('Ошибка сети при валидации токена:', error);
        return null;
    }
};
