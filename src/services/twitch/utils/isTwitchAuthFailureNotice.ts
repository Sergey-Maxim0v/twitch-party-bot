import { TWITCH_AUTH_FAILURE_NOTICE_TEXTS, TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Проверяет, что NOTICE сообщает об отказе авторизации Twitch.
 *
 * @param message - Разобранное IRC-сообщение.
 * @returns `true`, если Twitch отклонил авторизацию.
 */
export const isTwitchAuthFailureNotice = (message: ParsedIrcMessage): boolean => {
  if (message.command !== TWITCH_IRC_COMMANDS.NOTICE) return false

  const text = message.text.trim().toLowerCase()

  return TWITCH_AUTH_FAILURE_NOTICE_TEXTS.some(notice => notice.toLowerCase() === text)
}
