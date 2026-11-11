import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface MarkDeletedMessagesProps {
  modMessage: ParsedIrcMessage,
  currentMessages: ParsedIrcMessage[]
}

/**
 * Помечает сообщения удаленными на основе модераторской команды.
 * @param modMessage - Команда модерации (CLEARCHAT или CLEARMSG).
 * @param currentMessages - Текущая история сообщений.
 * @returns Обновленная история сообщений.
 */
export const markDeletedMessages = (
  { modMessage, currentMessages }: MarkDeletedMessagesProps): ParsedIrcMessage[] => {
  const { command, text, tags } = modMessage

  // Полная очистка чата (CLEARCHAT без указания пользователя)
  if (command === TWITCH_IRC_COMMANDS.CLEAR_CHAT && !text?.trim()) {
    return currentMessages.map(msg => ({
      ...msg,
      isDeleted: true,
      tags: { ...msg.tags, [TWITCH_IRC_TAGS.IS_DELETED]: '1', 'mod-action': 'clearchat' },
    }))
  }

  // Бан или тайм-аут конкретного пользователя
  if (command === TWITCH_IRC_COMMANDS.CLEAR_CHAT && text?.trim()) {
    const bannedUser = text.trim().toLowerCase()
    return currentMessages.map(msg =>
      msg.user.nick.toLowerCase() === bannedUser
        ? { ...msg, isDeleted: true, tags: { ...msg.tags, [TWITCH_IRC_TAGS.IS_DELETED]: '1', 'mod-action': 'ban' } }
        : msg,
    )
  }

  // Удаление одного сообщения по его ID
  if (command === TWITCH_IRC_COMMANDS.CLEAR_MSG) {
    const targetMsgId = tags['target-msg-id']
    if (!targetMsgId) return currentMessages

    return currentMessages.map(msg =>
      msg.id === targetMsgId
        ? { ...msg, isDeleted: true, tags: { ...msg.tags, [TWITCH_IRC_TAGS.IS_DELETED]: '1', 'mod-action': 'clearmsg' } }
        : msg,
    )
  }

  return currentMessages
}
