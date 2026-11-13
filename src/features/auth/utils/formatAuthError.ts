import { TWITCH_AUTH_ERRORS, TWITCH_AUTH_UI_MESSAGES } from '../../../constants/auth.constants.ts'

/**
 * Приводит ошибку авторизации к тексту для интерфейса.
 *
 * @param error - Код или описание ошибки от Twitch.
 * @returns Текст ошибки для показа пользователю.
 */
export const formatAuthError = (error: string): string => (
  error === TWITCH_AUTH_ERRORS.CSRF_FAILED
    ? TWITCH_AUTH_UI_MESSAGES.CSRF_FAILED
    : `${TWITCH_AUTH_UI_MESSAGES.DENIED} ${error}`
)

/**
 * Возвращает безопасный для интерфейса текст ошибки.
 *
 * @param error - Пойманная ошибка.
 * @param fallback - Текст для неизвестных и браузерных ошибок.
 * @returns Сообщение для пользователя.
 */
export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error)) return fallback

  if (typeof DOMException !== 'undefined' && error instanceof DOMException) return fallback

  return error.message || fallback
}
