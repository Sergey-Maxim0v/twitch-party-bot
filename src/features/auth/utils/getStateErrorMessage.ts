import { AUTH_STATE_VALIDATION_RESULTS, TWITCH_AUTH_UI_MESSAGES } from '../../../constants/auth.constants.ts'
import type { AuthStateValidationResult } from '../types'

/**
 * Преобразует результат проверки `state` в текст ошибки.
 *
 * @param result - Результат проверки попытки входа.
 * @returns Текст ошибки или `null`, если проверка пройдена.
 */
export const getStateErrorMessage = (result: AuthStateValidationResult): string | null => {
  if (result === AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE) return TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_UNAVAILABLE
  if (result === AUTH_STATE_VALIDATION_RESULTS.EXPIRED) return TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_EXPIRED
  if (result === AUTH_STATE_VALIDATION_RESULTS.INVALID) return TWITCH_AUTH_UI_MESSAGES.CSRF_FAILED

  return null
}
