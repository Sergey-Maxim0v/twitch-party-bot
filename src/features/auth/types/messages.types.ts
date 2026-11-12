import { TWITCH_AUTH_MESSAGE_TYPE } from '../../../constants/auth.constants.ts'

export type TwitchAuthMessageType = typeof TWITCH_AUTH_MESSAGE_TYPE

/**
 * Сообщение, которое всплывающее окно авторизации отправляет родительскому окну.
 */
export interface TwitchAuthMessageData {
  type: TwitchAuthMessageType;
  token: string | null;
  error: string | null;
}
