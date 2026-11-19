import { CHAT_MESSAGE_SYSTEM_KINDS, type ChatMessageSystemKind } from '../../../constants/chat-message.constants.ts'
import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Определяет вид оформления системного сообщения.
 */
export const getChatMessageSystemKind = (msg: ParsedIrcMessage): ChatMessageSystemKind => {
  if (msg.isAnnouncement) return CHAT_MESSAGE_SYSTEM_KINDS.ANNOUNCEMENT
  if (msg.command === TWITCH_IRC_COMMANDS.USER_NOTICE) return CHAT_MESSAGE_SYSTEM_KINDS.ALERT

  return CHAT_MESSAGE_SYSTEM_KINDS.DEFAULT
}
