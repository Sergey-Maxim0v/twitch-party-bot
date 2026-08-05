import {TWITCH_HELIX_BASE_URL} from "../../../constants/url.constants.ts";
import {TWITCH_CLIENT_ID} from "../config.ts";
import {validateChannelName} from "./validateChannelName.ts";

export interface TwitchChannelData {
    id: string;
    login: string;
    displayName: string;
    profileImageUrl: string;
}

/**
 * Проверяет существование пользователя (канала) на платформе Twitch через Helix API.
 *
 * @param {string} channelName - Имя проверяемого канала.
 * @param {string} token - Авторизационный токен пользователя (Bearer).
 * @returns {Promise<boolean>} - true, если канал существует; false, если не найден или произошла ошибка.
 */
export const getTwitchChannelProfile = async (channelName: string, token: string): Promise<TwitchChannelData | null> => {
    const trimmed = channelName.trim().toLowerCase();

    if (!trimmed || !validateChannelName(trimmed)) {
        return null;
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
            return null;
        }

        const result = await response.json();

        if (Array.isArray(result.data) && result.data.length > 0) {
            const twitchUser = result.data[0];

            return {
                id: twitchUser.id,
                login: twitchUser.login,
                displayName: twitchUser.display_name,
                profileImageUrl: twitchUser.profile_image_url
            };
        }

        return null;
    } catch (error) {
        console.error('Ошибка сети при получении профиля канала:', error);
        return null;
    }
};

