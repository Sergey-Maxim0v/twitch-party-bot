import {
  TWITCH_AUTH_BASE_URL,
  TWITCH_AUTH_REDIRECT_URI,
  TWITCH_AUTH_SCOPES,
  TWITCH_AUTH_UI_MESSAGES,
  TWITCH_CLIENT_ID,
} from '../../../constants/auth.constants.ts'
import { generateRandomState } from './crypto.ts'

export interface TwitchAuthRequest {
  url: string;
  state: string;
}

/**
 * Собирает URL страницы авторизации Twitch.
 *
 * @param state - Одноразовое значение для защиты OAuth-потока от CSRF.
 * @returns URL страницы авторизации.
 * @throws {Error} Если Twitch Client ID не задан в переменных окружения.
 */
export const buildTwitchAuthUrl = (state: string): string => {
  if (!TWITCH_CLIENT_ID || TWITCH_CLIENT_ID === 'undefined') {
    throw new Error(TWITCH_AUTH_UI_MESSAGES.CLIENT_ID_MISSING)
  }

  const scopesString = `${TWITCH_AUTH_SCOPES.READ_CHAT} ${TWITCH_AUTH_SCOPES.WRITE_CHAT}`

  return `${TWITCH_AUTH_BASE_URL}/authorize` +
      `?client_id=${TWITCH_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(TWITCH_AUTH_REDIRECT_URI)}` +
      '&response_type=token' +
      `&scope=${encodeURIComponent(scopesString)}` +
      `&state=${state}`
}

/**
 * Создаёт одноразовый `state` и URL авторизации Twitch.
 *
 * @returns URL авторизации и сгенерированное значение `state`.
 */
export const createTwitchAuthRequest = (): TwitchAuthRequest => {
  const state = generateRandomState()

  return {
    state,
    url: buildTwitchAuthUrl(state),
  }
}
