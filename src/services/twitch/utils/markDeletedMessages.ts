import { TWITCH_IRC_COMMANDS, TWITCH_IRC_MOD_ACTIONS, TWITCH_IRC_TAG_ENABLED, TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface MarkDeletedMessagesProps {
  modMessage: ParsedIrcMessage,
  currentMessages: ParsedIrcMessage[]
}

/**
 * Помечает сообщения удаленными на основе модераторской команды.
 *
 * @param modMessage - Команда модерации (CLEARCHAT или CLEARMSG).
 * @param currentMessages - Текущая история сообщений.
 * @returns Обновленная история сообщений.
 */
export const markDeletedMessages = (
  { modMessage, currentMessages }: MarkDeletedMessagesProps): ParsedIrcMessage[] => {
  const { command, text, tags } = modMessage

  const markAsDeleted = (message: ParsedIrcMessage, modAction: string): ParsedIrcMessage => ({
    ...message,
    isDeleted: true,
    tags: { ...message.tags, [TWITCH_IRC_TAGS.IS_DELETED]: TWITCH_IRC_TAG_ENABLED, [TWITCH_IRC_TAGS.MOD_ACTION]: modAction },
  })

  if (command !== TWITCH_IRC_COMMANDS.CLEAR_CHAT && command !== TWITCH_IRC_COMMANDS.CLEAR_MSG) {
    return currentMessages
  }

  // Полная очистка чата (CLEARCHAT без указания пользователя)
  if (command === TWITCH_IRC_COMMANDS.CLEAR_CHAT && !text?.trim()) {
    return currentMessages.map(message => markAsDeleted(message, TWITCH_IRC_MOD_ACTIONS.CLEAR_CHAT))
  }

  // Бан или тайм-аут конкретного пользователя
  if (command === TWITCH_IRC_COMMANDS.CLEAR_CHAT && text?.trim()) {
    const bannedUser = text.trim().toLowerCase()

    return currentMessages.map(message =>
      message.user.nick.toLowerCase() === bannedUser
        ? markAsDeleted(message, TWITCH_IRC_MOD_ACTIONS.BAN)
        : message,
    )
  }

  // Удаление одного сообщения по его ID
  const targetMsgId = tags[TWITCH_IRC_TAGS.TARGET_MSG_ID]
  if (!targetMsgId) return currentMessages

  return currentMessages.map(message =>
    message.id === targetMsgId
      ? markAsDeleted(message, TWITCH_IRC_MOD_ACTIONS.CLEAR_MSG)
      : message,
  )
}
