import {
  TWITCH_CHANNEL_PROFILE_LOG_MESSAGES,
  TWITCH_CHANNEL_PROFILE_STATUSES,
  TWITCH_CLIENT_ID,
  TWITCH_UNAUTHORIZED_STATUS,
} from '../../../constants/auth.constants.ts'
import {
  TWITCH_HELIX_BASE_URL,
  TWITCH_HELIX_REQUEST_TIMEOUT_MS,
} from '../../../constants/twitch.constants.ts'
import { validateChannelName } from './validateChannelName.ts'

export interface TwitchChannelData {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string;
}

/**
 * Статус неудачной проверки канала.
 */
export type TwitchChannelProfileFailure =
  | typeof TWITCH_CHANNEL_PROFILE_STATUSES.NOT_FOUND
  | typeof TWITCH_CHANNEL_PROFILE_STATUSES.UNAVAILABLE

/**
 * Результат проверки канала на Twitch.
 */
export type TwitchChannelProfileResult =
  | { status: typeof TWITCH_CHANNEL_PROFILE_STATUSES.FOUND; data: TwitchChannelData }
  | { status: TwitchChannelProfileFailure | typeof TWITCH_CHANNEL_PROFILE_STATUSES.UNAUTHORIZED }

interface TwitchHelixUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchHelixUsersResponse {
  data?: TwitchHelixUser[];
}

/**
 * Получает профиль канала через Twitch Helix API.
 *
 * @param channelName - Имя проверяемого канала.
 * @param token - Токен доступа пользователя.
 * @returns Данные канала, статус неудачной проверки или признак отклонённого токена.
 */
export const getTwitchChannelProfile = async (
  channelName: string,
  token: string,
): Promise<TwitchChannelProfileResult> => {
  const trimmed = channelName.trim().toLowerCase()

  if (!trimmed || !validateChannelName(trimmed)) {
    return { status: TWITCH_CHANNEL_PROFILE_STATUSES.NOT_FOUND }
  }

  try {
    const response = await fetch(`${TWITCH_HELIX_BASE_URL}/users?login=${trimmed}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
      signal: AbortSignal.timeout(TWITCH_HELIX_REQUEST_TIMEOUT_MS),
    })

    if (response.status === TWITCH_UNAUTHORIZED_STATUS) {
      return { status: TWITCH_CHANNEL_PROFILE_STATUSES.UNAUTHORIZED }
    }

    if (response.status === 404) {
      return { status: TWITCH_CHANNEL_PROFILE_STATUSES.NOT_FOUND }
    }

    if (!response.ok) {
      console.error(TWITCH_CHANNEL_PROFILE_LOG_MESSAGES.HTTP_ERROR(response.status))
      return { status: TWITCH_CHANNEL_PROFILE_STATUSES.UNAVAILABLE }
    }

    const result = await response.json() as TwitchHelixUsersResponse
    const twitchUser = Array.isArray(result.data) ? result.data[0] : undefined

    if (!twitchUser) {
      return { status: TWITCH_CHANNEL_PROFILE_STATUSES.NOT_FOUND }
    }

    return {
      status: TWITCH_CHANNEL_PROFILE_STATUSES.FOUND,
      data: {
        id: twitchUser.id,
        login: twitchUser.login,
        displayName: twitchUser.display_name,
        profileImageUrl: twitchUser.profile_image_url,
      },
    }
  } catch (error) {
    console.error(TWITCH_CHANNEL_PROFILE_LOG_MESSAGES.NETWORK_ERROR, error)
    return { status: TWITCH_CHANNEL_PROFILE_STATUSES.UNAVAILABLE }
  }
}
