import { type RefObject, useCallback, useState } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import {
  TWITCH_CHAT_CHANNEL_PREFIX,
  TWITCH_CHAT_FALLBACK_AUTHOR_NAME,
  TWITCH_IRC_COMMANDS,
  TWITCH_IRC_TAGS,
} from '../../../constants/twitch.constants.ts'
import { markDeletedMessages } from '../utils/markDeletedMessages.ts'
import { createSystemMessage } from '../utils/createSystemMessage.ts'
import { trimChatHistory } from '../utils/trimChatHistory.ts'
import { useTwitchChannelChange } from './useTwitchChannelChange.ts'
import type { ParsedIrcMessage, PendingChatMessage } from '../types.ts'

interface UseTwitchChatHistoryProps {
  client: TwitchIrcClient | null;
  pendingMessagesRef: RefObject<PendingChatMessage[]>;
}

/**
 * Хук для управления историей сообщений чата Twitch и модерацией.
 */
export const useTwitchChatHistory = ({ client, pendingMessagesRef }: UseTwitchChatHistoryProps) => {
  const [messages, setMessages] = useState<ParsedIrcMessage[]>([])

  // Смена канала очищает историю сообщений
  useTwitchChannelChange(client, () => {
    setMessages([])
  })

  /**
   * Обрабатывает модераторские действия, системные события и служебные логи.
   * @param message - Входящее IRC-сообщение.
   * @returns `true`, если сообщение обработано и не требует дальнейшей обработки.
   */
  const handleModerationAndEvents = useCallback((message: ParsedIrcMessage): boolean => {
    const isModAction = message.command === TWITCH_IRC_COMMANDS.CLEAR_CHAT || message.command === TWITCH_IRC_COMMANDS.CLEAR_MSG
    const isChannelEvent = message.command === TWITCH_IRC_COMMANDS.USER_NOTICE || message.command === TWITCH_IRC_COMMANDS.ROOM_STATE
    const isNotice = message.command === TWITCH_IRC_COMMANDS.NOTICE
    const isSessionControl = message.command === TWITCH_IRC_COMMANDS.RECONNECT || message.command === TWITCH_IRC_COMMANDS.GLOBAL_USER_STATE

    if (!isModAction && !isChannelEvent && !isNotice && !isSessionControl) return false

    const systemLog = createSystemMessage(message)

    if (!systemLog) return true

    setMessages(prev => {
      const updatedHistory = isModAction ? markDeletedMessages({ modMessage: message, currentMessages: prev }) : prev

      return trimChatHistory([...updatedHistory, systemLog])
    })

    return true
  }, [])

  /**
   * Добавляет в историю сообщение зрителя или своё сообщение, собранное из USERSTATE.
   * Роли своего сообщения берутся из тегов Twitch, как у входящего PRIVMSG.
   *
   * @returns Добавленное сообщение или `undefined`, если сообщение не обработано.
   */
  const handleStandardMessage = useCallback((
    message: ParsedIrcMessage,
    currentUserLogin: string,
    currentChannel: string | null,
  ): ParsedIrcMessage | undefined => {
    const isUserstate = message.command === TWITCH_IRC_COMMANDS.USER_STATE
    const isPrivmsg = message.command === TWITCH_IRC_COMMANDS.PRIV_MSG

    if (!isUserstate && !isPrivmsg) return undefined

    // USERSTATE не содержит текста — берём его из очереди отправленных сообщений
    const pendingMessage = isUserstate ? pendingMessagesRef.current.shift() : undefined
    const savedText = pendingMessage?.text

    if (isUserstate && !savedText) return undefined

    pendingMessage?.onConfirmed?.()

    const authorName = isUserstate
      ? (message.tags[TWITCH_IRC_TAGS.DISPLAY_NAME] || currentUserLogin || TWITCH_CHAT_FALLBACK_AUTHOR_NAME)
      : (message.user.displayName || message.user.nick)

    const cleanChannel = currentChannel?.toLowerCase().replace(TWITCH_CHAT_CHANNEL_PREFIX, '')
    const isBroadcaster = Boolean(cleanChannel) && currentUserLogin.toLowerCase() === cleanChannel

    const messageToPush: ParsedIrcMessage = {
      ...message,
      command: TWITCH_IRC_COMMANDS.PRIV_MSG,
      text: savedText ?? message.text,
      isAutomated: pendingMessage?.isAutomated,
      user: isPrivmsg
        ? message.user
        : {
          ...message.user,
          nick: authorName.toLowerCase(),
          displayName: authorName,
          isBroadcaster,
        },
    }

    setMessages(prev => {
      const isDuplicate = prev.some(m => m.text === messageToPush.text && m.timestamp === messageToPush.timestamp && m.user.nick === messageToPush.user.nick)

      if (isDuplicate) return prev

      return trimChatHistory([...prev, messageToPush])
    })

    return messageToPush
  }, [pendingMessagesRef])

  return {
    messages,
    handleModerationAndEvents,
    handleStandardMessage,
  }
}
