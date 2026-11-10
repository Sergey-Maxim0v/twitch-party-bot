import { isValidState } from './crypto.ts'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { TWITCH_AUTH_ERRORS } from '../../../constants/auth.constants.ts'

interface TwitchHashData {
  token: string | null;
  error: string | null;
}

/**
 * Извлекает токен или ошибку авторизации из URL.
 * Если код выполняется внутри всплывающего окна, результат пересылается
 * в родительское окно, после чего popup закрывается.
 *
 * @returns Токен доступа и/или текст ошибки авторизации.
 * @see {@link https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/}
 */
export const extractTwitchToken = (): TwitchHashData => {
  const { hash, search } = window.location

  let token: string | null = null
  let error: string | null = null

  if (search) {
    const searchParams = new URLSearchParams(search)
    const errorType = searchParams.get('error')
    const errorDesc = searchParams.get('error_description')

    if (errorType) {
      error = errorDesc || errorType
    }
  }

  if (hash && !error) {
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const state = hashParams.get('state')

    token = accessToken

    if (accessToken && !isValidState(state)) {
      token = null
      error = TWITCH_AUTH_ERRORS.CSRF_FAILED
    }
  }

  const isPopup = window.opener && window.opener !== window

  if (isPopup && (token || error)) {
    const messagePayload: TwitchAuthMessageData = {
      type: 'TWITCH_AUTH_RESULT',
      token,
      error,
    }

    window.opener.postMessage(messagePayload, window.location.origin)
    window.close()
  }

  if (!isPopup && (hash || search)) {
    window.history.replaceState(null, '', window.location.pathname)
  }

  return { token, error }
}
