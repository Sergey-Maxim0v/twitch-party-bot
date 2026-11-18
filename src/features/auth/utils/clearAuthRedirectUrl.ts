import { TWITCH_SESSION_ERRORS } from '../../../constants/auth.constants.ts'

let isCleanupErrorReported = false

/**
 * Убирает OAuth-параметры из адресной строки, чтобы токен не остался в истории браузера.
 */
export const clearAuthRedirectUrl = (): void => {
  if (!window.location.hash && !window.location.search) return

  try {
    window.history.replaceState(null, '', window.location.pathname)
  } catch (error) {
    if (isCleanupErrorReported) return

    isCleanupErrorReported = true
    console.error(TWITCH_SESSION_ERRORS.REDIRECT_CLEANUP_FAILED, error)
  }
}
