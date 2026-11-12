import { TWITCH_AUTH_ERRORS, TWITCH_AUTH_URL_PARAMS } from '../../../constants/auth.constants.ts'
import { isValidState } from './crypto.ts'
import type { TwitchAuthResponse } from '../types'

/**
 * Разбирает URL после редиректа Twitch: извлекает токен или ошибку авторизации.
 *
 * Проверка `state` одноразовая: сохранённое значение удаляется при чтении.
 *
 * @returns Токен доступа и/или текст ошибки авторизации.
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 */
export const parseTwitchAuthResponse = (): TwitchAuthResponse => {
  const { hash, search } = window.location

  const searchParams = new URLSearchParams(search)
  const errorType = searchParams.get(TWITCH_AUTH_URL_PARAMS.ERROR)

  if (errorType) {
    const errorDescription = searchParams.get(TWITCH_AUTH_URL_PARAMS.ERROR_DESCRIPTION)

    return { token: null, error: errorDescription || errorType }
  }

  const hashParams = new URLSearchParams(hash.replace('#', ''))
  const accessToken = hashParams.get(TWITCH_AUTH_URL_PARAMS.ACCESS_TOKEN)

  if (!accessToken) {
    return { token: null, error: null }
  }

  const state = hashParams.get(TWITCH_AUTH_URL_PARAMS.STATE)

  if (!isValidState(state)) {
    return { token: null, error: TWITCH_AUTH_ERRORS.CSRF_FAILED }
  }

  return { token: accessToken, error: null }
}
