type TwitchAuthMessageType = 'TWITCH_AUTH_RESULT'

/**
 * Сообщение, которое всплывающее окно авторизации отправляет родительскому окну.
 */
export interface TwitchAuthMessageData {
  type: TwitchAuthMessageType;
  token: string | null;
  error: string | null;
}
