import {
  TWITCH_AUTH_BASE_URL,
  TWITCH_TOKEN_REJECTED_STATUSES,
  TWITCH_TOKEN_VALIDATION_STATUSES,
  TWITCH_TOKEN_VALIDATION_TIMEOUT_MS,
} from '../../../constants/auth.constants.ts'
import { isFilledString } from '../../../utils/strings.ts'
import type { TwitchUserData } from '../types'

/**
 * Результат проверки токена.
 * `unavailable` — сеть или Twitch недоступны; сессию сохраняем.
 */
export type TwitchTokenValidation =
  | { status: typeof TWITCH_TOKEN_VALIDATION_STATUSES.VALID; user: TwitchUserData }
  | { status: typeof TWITCH_TOKEN_VALIDATION_STATUSES.INVALID }
  | { status: typeof TWITCH_TOKEN_VALIDATION_STATUSES.UNAVAILABLE }

/**
 * Проверяет токен через Twitch API.
 *
 * @param token - Проверяемый токен доступа OAuth.
 * @returns Статус проверки и данные пользователя при успехе.
 * @see {@link https://dev.twitch.tv/docs/authentication/validate-tokens}
 */
export const validateTwitchToken = async (token: string): Promise<TwitchTokenValidation> => {
  try {
    const response: Response = await fetch(TWITCH_AUTH_BASE_URL + '/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(TWITCH_TOKEN_VALIDATION_TIMEOUT_MS),
    })

    if (TWITCH_TOKEN_REJECTED_STATUSES.includes(response.status)) {
      return { status: TWITCH_TOKEN_VALIDATION_STATUSES.INVALID }
    }

    if (!response.ok) {
      console.error(`Ошибка проверки токена Twitch: HTTP ${response.status}`)
      return { status: TWITCH_TOKEN_VALIDATION_STATUSES.UNAVAILABLE }
    }

    const data = await response.json() as { user_id?: unknown; login?: unknown } | null

    // Пустой логин делает сессию бесполезной: сокет не подключится.
    if (!isFilledString(data?.user_id) || !isFilledString(data?.login)) {
      return { status: TWITCH_TOKEN_VALIDATION_STATUSES.INVALID }
    }

    return {
      status: TWITCH_TOKEN_VALIDATION_STATUSES.VALID,
      user: {
        userId: data.user_id,
        login: data.login,
      },
    }
  } catch (error) {
    console.error('Ошибка сети при валидации токена:', error)
    return { status: TWITCH_TOKEN_VALIDATION_STATUSES.UNAVAILABLE }
  }
}
