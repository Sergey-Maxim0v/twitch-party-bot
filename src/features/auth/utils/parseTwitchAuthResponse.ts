import { TWITCH_AUTH_URL_PARAMS } from '../../../constants/auth.constants.ts'
import type { TwitchAuthResponse } from '../types'

/**
 * Разбирает URL после редиректа Twitch и извлекает токен, ошибку и `state`.
 *
 * @returns Данные ответа Twitch без обращения к хранилищу.
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 */
export const parseTwitchAuthResponse = (): TwitchAuthResponse => {
  const { hash, search } = window.location

  const searchParams = new URLSearchParams(search)
  const errorType = searchParams.get(TWITCH_AUTH_URL_PARAMS.ERROR)

  if (errorType) {
    const errorDescription = searchParams.get(TWITCH_AUTH_URL_PARAMS.ERROR_DESCRIPTION)

    return {
      token: null,
      error: errorDescription || errorType,
      state: searchParams.get(TWITCH_AUTH_URL_PARAMS.STATE),
    }
  }

  const hashParams = new URLSearchParams(hash.replace('#', ''))
  const accessToken = hashParams.get(TWITCH_AUTH_URL_PARAMS.ACCESS_TOKEN)

  if (!accessToken) {
    return { token: null, error: null, state: null }
  }

  return {
    token: accessToken,
    error: null,
    state: hashParams.get(TWITCH_AUTH_URL_PARAMS.STATE),
  }
}
