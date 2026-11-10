import { TWITCH_HELIX_BASE_URL } from '../../../constants/twitch.constants.ts'
import { TWITCH_CLIENT_ID } from '../../../constants/auth.constants.ts'
import { validateChannelName } from './validateChannelName.ts'

export interface TwitchChannelData {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
}

/**
 * Получает профиль канала на Twitch через Helix API.
 *
 * @param channelName - Имя проверяемого канала.
 * @param token - Авторизационный токен пользователя (Bearer).
 * @returns Данные канала или `null`, если канал не найден либо запрос завершился ошибкой.
 */
export const getTwitchChannelProfile = async (channelName: string, token: string): Promise<TwitchChannelData | null> => {
  const trimmed = channelName.trim().toLowerCase()

  if (!trimmed || !validateChannelName(trimmed)) {
    return null
  }

  try {
    const response = await fetch(`${TWITCH_HELIX_BASE_URL}/users?login=${trimmed}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return null
    }

    const twitchUser = result.data[0]

    return {
      id: twitchUser.id,
      login: twitchUser.login,
      displayName: twitchUser.display_name,
      profileImageUrl: twitchUser.profile_image_url,
    }
  } catch (error) {
    console.error('Ошибка сети при получении профиля канала:', error)
    return null
  }
}
