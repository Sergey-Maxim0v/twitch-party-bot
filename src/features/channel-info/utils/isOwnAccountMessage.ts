import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../../../services/twitch/types.ts'

/**
 * Определяет, описывает ли сообщение состояние собственного аккаунта бота в канале.
 * USERSTATE содержит роли отправленного клиента, а сообщения чата — роли их автора.
 *
 * @param message - Входящее IRC-сообщение.
 * @param userLogin - Логин собственного аккаунта бота.
 * @returns `true`, если сообщение описывает роли собственного аккаунта.
 */
export const isOwnAccountMessage = (message: ParsedIrcMessage, userLogin?: string): boolean => {
  if (message.command === TWITCH_IRC_COMMANDS.USER_STATE) return true

  if (message.command !== TWITCH_IRC_COMMANDS.PRIV_MSG) return false
  if (!userLogin) return false

  return message.user.nick?.toLowerCase() === userLogin.toLowerCase()
}
