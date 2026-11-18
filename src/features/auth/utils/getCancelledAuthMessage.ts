import { AUTH_STATE_VALIDATION_RESULTS, TWITCH_AUTH_UI_MESSAGES } from '../../../constants/auth.constants.ts'
import type { AuthStateValidationResult } from '../types'

/**
 * Подбирает текст ошибки для входа, прерванного до ответа Twitch.
 *
 * @param result - Результат проверки попытки входа.
 * @returns Текст ошибки для показа пользователю.
 */
export const getCancelledAuthMessage = (result: AuthStateValidationResult): string => (
  result === AUTH_STATE_VALIDATION_RESULTS.EXPIRED
    ? TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_EXPIRED
    : TWITCH_AUTH_UI_MESSAGES.AUTH_CANCELLED
)
