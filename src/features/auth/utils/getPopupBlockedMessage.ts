import { TWITCH_AUTH_UI_MESSAGES } from '../../../constants/auth.constants.ts'

/**
 * Выбирает текст ошибки блокировки popup с учётом доступности запасного входа.
 *
 * @param canFallback - Доступен ли вход в текущей вкладке.
 * @returns Текст ошибки для модального окна.
 */
export const getPopupBlockedMessage = (canFallback: boolean): string => (
  canFallback
    ? TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED
    : TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED_WITHOUT_FALLBACK
)
