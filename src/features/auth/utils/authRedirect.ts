import { TWITCH_AUTH_BROADCAST_CHANNEL, TWITCH_AUTH_MESSAGE_TYPE, TWITCH_SESSION_ERRORS } from '../../../constants/auth.constants.ts'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import type { TwitchAuthResponse } from '../types'

let isCleanupErrorReported = false

/**
 * Проверяет, что текущее окно открыто как всплывающее окно авторизации.
 *
 * @returns `true`, если у окна есть открывающее его родительское окно.
 */
export const isAuthPopupWindow = (): boolean => Boolean(window.opener) && window.opener !== window

/**
 * Создаёт BroadcastChannel для передачи результата авторизации между окнами
 * одного источника. Не зависит от window.opener/WindowProxy.
 *
 * @returns Канал авторизации.
 */
export const openAuthBroadcastChannel = (): BroadcastChannel => (
  new BroadcastChannel(TWITCH_AUTH_BROADCAST_CHANNEL)
)

/**
 * Отправляет результат авторизации через BroadcastChannel.
 *
 * @param channel - Канал авторизации.
 * @param response - Результат разбора ответа Twitch.
 */
export const postAuthResult = (channel: BroadcastChannel, response: TwitchAuthResponse): void => {
  const message: TwitchAuthMessageData = {
    type: TWITCH_AUTH_MESSAGE_TYPE,
    token: response.token,
    error: response.error,
    state: response.state,
  }

  channel.postMessage(message)
}

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
