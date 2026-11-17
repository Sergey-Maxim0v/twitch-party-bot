import { TWITCH_AUTH_MESSAGE_TYPE } from '../../../constants/auth.constants.ts'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { isFilledString } from '../../../utils/strings.ts'

/**
 * Проверяет, что данные из BroadcastChannel похожи на результат авторизации.
 *
 * @param value - Данные события канала.
 * @returns `true`, если сообщение содержит тип, `state` и результат входа.
 */
export const isTwitchAuthMessage = (value: unknown): value is TwitchAuthMessageData => {
  if (typeof value !== 'object' || value === null) return false

  const { type, token, error, state } = value as Partial<TwitchAuthMessageData>

  if (type !== TWITCH_AUTH_MESSAGE_TYPE) return false
  if (!isFilledString(state)) return false

  return isFilledString(token) || isFilledString(error)
}
