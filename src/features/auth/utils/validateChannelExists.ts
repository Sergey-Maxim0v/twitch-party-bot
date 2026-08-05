import {TWITCH_HELIX_BASE_URL} from "../../../constants/url.constants.ts";
import {TWITCH_CLIENT_ID} from "../config.ts";
import {validateChannelName} from "./validateChannelName.ts";

/**
 * Проверяет существование пользователя (канала) на платформе Twitch через Helix API.
 *
 * @param {string} channelName - Имя проверяемого канала.
 * @param {string} token - Авторизационный токен пользователя (Bearer).
 * @returns {Promise<boolean>} - true, если канал существует; false, если не найден или произошла ошибка.
 */
export const validateChannelExists = async (channelName: string, token: string): Promise<boolean> => {
    const trimmed = channelName.trim().toLowerCase();

    if (!trimmed || !validateChannelName(trimmed)) {
        return false;
    }

    try {
        const response = await fetch(`${TWITCH_HELIX_BASE_URL}/users?login=${trimmed}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Client-Id': TWITCH_CLIENT_ID
            }
        });

        if (!response.ok) {
            return false;
        }

        const result = await response.json();
        
        // Helix API возвращает массив в поле data. Если он пустой — канала нет.
        return Array.isArray(result.data) && result.data.length > 0;
    } catch (error) {
        console.error('Ошибка сети при проверке существования канала:', error);
        return false;
    }
}
