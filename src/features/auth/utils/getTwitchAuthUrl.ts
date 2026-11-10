import { TWITCH_AUTH_BASE_URL, TWITCH_CLIENT_ID, TWITCH_AUTH_REDIRECT_URI, TWITCH_AUTH_SCOPES } from '../../../constants/auth.constants.ts'
import { generateRandomState, saveAuthState } from './crypto.ts'

/**
 * Генерирует URL-адрес для авторизации пользователя на стороне клиента.
 *
 * @returns URL страницы авторизации Twitch с параметрами приложения.
 * @throws {Error} Если Twitch Client ID не задан в переменных окружения.
 */
export const getTwitchAuthUrl = (): string => {
  if (!TWITCH_CLIENT_ID || TWITCH_CLIENT_ID === 'undefined') {
    throw new Error('Twitch Client ID не найден в конфигурации приложения. Проверьте настройки CI/CD.')
  }

  const state = generateRandomState()
  saveAuthState(state)

  const scopesString = `${TWITCH_AUTH_SCOPES.READ_CHAT} ${TWITCH_AUTH_SCOPES.WRITE_CHAT}`

  return `${TWITCH_AUTH_BASE_URL}/authorize` +
      `?client_id=${TWITCH_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(TWITCH_AUTH_REDIRECT_URI)}` +
      '&response_type=token' +
      `&scope=${encodeURIComponent(scopesString)}` +
      `&state=${state}`
}
