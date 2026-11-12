import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import {
  TWITCH_CHAT_CHANNEL_PREFIX,
  TWITCH_CHAT_FALLBACK_AUTHOR_NAME,
  TWITCH_CHAT_HISTORY_MAX_MESSAGES,
  TWITCH_CHAT_MESSAGE_ID,
  TWITCH_IRC_COMMANDS,
  TWITCH_IRC_TAGS,
} from '../../../constants/twitch.constants.ts'
import { markDeletedMessages } from '../utils/markDeletedMessages.ts'
import { createSystemMessage } from '../utils/createSystemMessage.ts'
import type { ParsedIrcMessage, PendingChatMessage } from '../types.ts'

interface UseTwitchChatHistoryProps {
  client: TwitchIrcClient | null;
  pendingMessagesRef: RefObject<PendingChatMessage[]>;
  roomStateTagsRef: RefObject<Record<string, string>>;
}

/**
 * Хук для управления историей сообщений чата Twitch и модерацией.
 */
export const useTwitchChatHistory = ({ client, pendingMessagesRef, roomStateTagsRef }: UseTwitchChatHistoryProps) => {
  const [messages, setMessages] = useState<ParsedIrcMessage[]>([])

  const lastChannelRef = useRef<string | null>(null)

  useEffect(() => {
    if (!client?.onChannelChange) return

    if (client.currentChannel) {
      lastChannelRef.current = client.currentChannel
    }

    client.onChannelChange(() => {
      const nextChannel = client.currentChannel
      const isChannelChanged = nextChannel !== lastChannelRef.current

      lastChannelRef.current = nextChannel

      if (!isChannelChanged) return

      setMessages([])
      roomStateTagsRef.current = {}
    })
  }, [client, roomStateTagsRef])

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
      const finalMessages = [...updatedHistory, systemLog]

      return finalMessages.length > TWITCH_CHAT_HISTORY_MAX_MESSAGES ? finalMessages.slice(finalMessages.length - TWITCH_CHAT_HISTORY_MAX_MESSAGES) : finalMessages
    })

    return true
  }, [])

  /**
   * Добавляет стандартные текстовые сообщения в общую историю чата.
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

    const { PREFIX, RANDOM_END, RANDOM_RADIX, RANDOM_START } = TWITCH_CHAT_MESSAGE_ID
    const randomSuffix = Math.random().toString(RANDOM_RADIX).slice(RANDOM_START, RANDOM_END)
    const uniqueId = `${PREFIX}${message.id}-${Date.now()}-${randomSuffix}`

    const cleanChannel = currentChannel?.toLowerCase().replace(TWITCH_CHAT_CHANNEL_PREFIX, '')
    const isBroadcaster = Boolean(cleanChannel) && currentUserLogin.toLowerCase() === cleanChannel
    const isModerator = isBroadcaster || Boolean(message.user.isModerator)

    const messageToPush: ParsedIrcMessage = {
      ...message,
      id: uniqueId,
      command: TWITCH_IRC_COMMANDS.PRIV_MSG,
      text: savedText ?? message.text,
      user: isPrivmsg
        ? message.user
        : {
          ...message.user,
          nick: authorName.toLowerCase(),
          displayName: authorName,
          isBroadcaster,
          isModerator,
        },
    }

    setMessages(prev => {
      if (prev.some(m => m.text === messageToPush.text && m.timestamp === messageToPush.timestamp && m.user.nick === messageToPush.user.nick)) {
        return prev
      }

      const nextHistory = [...prev, messageToPush]
      if (nextHistory.length > TWITCH_CHAT_HISTORY_MAX_MESSAGES) {
        return nextHistory.slice(nextHistory.length - TWITCH_CHAT_HISTORY_MAX_MESSAGES)
      }
      return nextHistory
    })

    return messageToPush
  }, [pendingMessagesRef])

  return {
    messages,
    handleModerationAndEvents,
    handleStandardMessage,
  }
}
