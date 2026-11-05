import { TWITCH_AUTH_BASE_URL, TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI, TWITCH_SCOPES } from '../config'
import { generateRandomState, saveAuthState } from './crypto.ts'

/**
 * Генерирует URL-адрес для авторизации пользователя на стороне клиента.
 * @throws {Error} Если Twitch Client ID не задан в переменных окружения.
 */
export const getTwitchAuthUrl = (): string => {
  // Защитная проверка на случай сбоев конфигурации CI/CD сборки
  if (!TWITCH_CLIENT_ID || TWITCH_CLIENT_ID === 'undefined') {
    throw new Error('Twitch Client ID не найден в конфигурации приложения. Проверьте настройки CI/CD.')
  }

  const state = generateRandomState()
  saveAuthState(state)

  const scopesString = `${TWITCH_SCOPES.READ_CHAT} ${TWITCH_SCOPES.WRITE_CHAT}`

  return `${TWITCH_AUTH_BASE_URL}/authorize` +
      `?client_id=${TWITCH_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}` +
      '&response_type=token' +
      `&scope=${encodeURIComponent(scopesString)}` +
      `&state=${state}`
}
