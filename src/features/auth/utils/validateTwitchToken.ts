import { TWITCH_AUTH_BASE_URL } from '../../../constants/auth.constants.ts'
import type { TwitchUserData } from '../types'

/**
 * Отправляет запрос на сервера Twitch для проверки активности токена.
 *
 * @param token - Проверяемый токен доступа OAuth.
 * @returns Данные пользователя при успехе, иначе `null`.
 * @see {@link https://dev.twitch.tv/docs/authentication/validate-tokens}
 */
export const validateTwitchToken = async (token: string): Promise<TwitchUserData | null> => {
  try {
    const response: Response = await fetch(TWITCH_AUTH_BASE_URL + '/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 401) {
      return null
    }

    const data = await response.json()
    return {
      userId: data.user_id,
      login: data.login,
    }
  } catch (error) {
    console.error('Ошибка сети при валидации токена:', error)
    return null
  }
}
