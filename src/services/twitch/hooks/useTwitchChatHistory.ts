import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import { TWITCH_CHAT_HISTORY_MAX_MESSAGES, TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import { markDeletedMessages } from '../utils/markDeletedMessages.ts'
import { createSystemMessage } from '../utils/createSystemMessage.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface UseTwitchChatHistoryProps {
  client: TwitchIrcClient | null;
  pendingTextsRef: RefObject<string[]>;
  roomStateTagsRef: RefObject<Record<string, string>>;
}

/**
 * Хук для управления историей сообщений чата Twitch и модерацией.
 */
export const useTwitchChatHistory = ({ client, pendingTextsRef, roomStateTagsRef }: UseTwitchChatHistoryProps) => {
  const [messages, setMessages] = useState<ParsedIrcMessage[]>([])

  const lastChannelRef = useRef<string | null>(null)

  // Очистка чата и состояния комнаты при смене канала
  useEffect(() => {
    if (!client?.onChannelChange) return

    if (client.currentChannel) {
      lastChannelRef.current = client.currentChannel
    }

    client.onChannelChange(() => {
      const nextChannel = client.currentChannel

      if (nextChannel !== lastChannelRef.current) {
        setMessages([])

        if (roomStateTagsRef.current) {
          roomStateTagsRef.current = {}
        }
      }

      lastChannelRef.current = nextChannel
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

    if (isNotice && pendingTextsRef.current) {
      pendingTextsRef.current.shift()
    }

    const systemLog = createSystemMessage(message)

    if (!systemLog) return true

    setMessages(prev => {
      const updatedHistory = isModAction ? markDeletedMessages({ modMessage: message, currentMessages: prev }) : prev
      const finalMessages = [...updatedHistory, systemLog]

      return finalMessages.length > TWITCH_CHAT_HISTORY_MAX_MESSAGES ? finalMessages.slice(finalMessages.length - TWITCH_CHAT_HISTORY_MAX_MESSAGES) : finalMessages
    })

    return true
  }, [pendingTextsRef])

  /**
   * Добавляет стандартные текстовые сообщения в общую историю чата.
   * @returns Добавленное сообщение или `undefined`, если сообщение обработано не было.
   */
  const handleStandardMessage = useCallback((
    message: ParsedIrcMessage,
    currentUserLogin: string,
    currentChannel: string | null,
  ): ParsedIrcMessage | undefined => {
    const isUserstate = message.command === TWITCH_IRC_COMMANDS.USER_STATE
    const isPrivmsg = message.command === TWITCH_IRC_COMMANDS.PRIV_MSG

    if (!isUserstate && !isPrivmsg) return undefined

    let savedText: string | null | undefined = null
    const enrichedTags = { ...message.tags }

    if (isUserstate) {
      const pendingTexts = pendingTextsRef.current
      savedText = pendingTexts ? pendingTexts.shift() : null

      if (!savedText) return undefined

      // В быстрых ответах USER_STATE может не содержать badges — вычисляем роли вручную
      if (!enrichedTags.badges) {
        const cleanChannel = currentChannel?.toLowerCase().replace('#', '')
        const isCurrentBroadcaster = cleanChannel && currentUserLogin.toLowerCase() === cleanChannel

        if (isCurrentBroadcaster) {
          enrichedTags.badges = 'broadcaster/1,moderator/1'
        } else {
          enrichedTags.badges = 'moderator/1'
        }
        enrichedTags.mod = '1'
      }
    }

    const authorName = isUserstate
      ? (message.tags['display-name'] || currentUserLogin || 'Broadcaster')
      : (message.user.displayName || message.user.nick)

    const uniqueId = `msg-${message.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`

    const badgesStr = enrichedTags.badges || ''
    const isBroadcaster = badgesStr.includes('broadcaster/')
    const isModerator = badgesStr.includes('moderator/') || enrichedTags.mod === '1'
    const isVip = badgesStr.includes('vip/')

    const messageToPush: ParsedIrcMessage = {
      ...message,
      id: uniqueId,
      command: TWITCH_IRC_COMMANDS.PRIV_MSG,
      text: isUserstate ? (savedText ?? '') : message.text,
      user: isPrivmsg
        ? message.user
        : {
          ...message.user,
          nick: authorName.toLowerCase(),
          displayName: authorName,
          isBroadcaster,
          isModerator,
          isVip,
          color: enrichedTags.color || message.user?.color || '',
        },
      tags: enrichedTags,
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
  }, [pendingTextsRef])

  return {
    messages,
    handleModerationAndEvents,
    handleStandardMessage,
  }
}
