import { TWITCH_CHAT_HISTORY_MAX_MESSAGES } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Обрезает историю чата до лимита, сохраняя последние сообщения.
 *
 * @param messages - Сообщения истории чата.
 * @returns История, ограниченная лимитом `TWITCH_CHAT_HISTORY_MAX_MESSAGES`.
 */
export const trimChatHistory = (messages: ParsedIrcMessage[]): ParsedIrcMessage[] => {
  if (messages.length <= TWITCH_CHAT_HISTORY_MAX_MESSAGES) return messages

  return messages.slice(messages.length - TWITCH_CHAT_HISTORY_MAX_MESSAGES)
}
