import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchIrcClient } from '../twitchIrcClient.ts'
import { MAX_MESSAGES, TwitchIrcCommand } from '../config.ts'
import { markDeletedMessages } from '../utils/markDeletedMessages.ts'
import { createSystemMessage } from '../utils/createSystemMessage.ts'
import type { ParsedIrcMessage } from '../types.ts'

interface UseTwitchChatHistoryProps {
  client: TwitchIrcClient | null;
  pendingTextsRef: RefObject<string[]>;
}

/**
 * Хук для управления историей сообщений чата Twitch и модерацией.
 */
export const useTwitchChatHistory = ({ client, pendingTextsRef }: UseTwitchChatHistoryProps) => {
  const [messages, setMessages] = useState<ParsedIrcMessage[]>([])

  const lastChannelRef = useRef<string | null>(null)

  // Очистка чата при смене канала
  useEffect(() => {
    if (!client?.onChannelChange) return

    if (client.currentChannel) {
      lastChannelRef.current = client.currentChannel
    }

    client.onChannelChange(() => {
      const nextChannel = client.currentChannel

      if (nextChannel !== lastChannelRef.current) {
        setMessages([])
      }

      lastChannelRef.current = nextChannel
    })
  }, [client])

  /**
   * Обрабатывает модераторские действия (удаление сообщений, баны) и системные логи
   */
  const handleModerationAndEvents = useCallback((message: ParsedIrcMessage): boolean => {
    const isModAction = message.command === TwitchIrcCommand.CLEAR_CHAT || message.command === TwitchIrcCommand.CLEAR_MSG
    const isChannelEvent = message.command === TwitchIrcCommand.USER_NOTICE || message.command === TwitchIrcCommand.ROOM_STATE

    if (!isModAction && !isChannelEvent) return false

    setMessages(prev => {
      const updatedHistory = isModAction ? markDeletedMessages({ modMessage: message, currentMessages: prev }) : prev
      const systemLog = createSystemMessage(message)

      if (!systemLog) return updatedHistory

      const finalMessages = [...updatedHistory, systemLog]
      return finalMessages.length > MAX_MESSAGES ? finalMessages.slice(finalMessages.length - MAX_MESSAGES) : finalMessages
    })

    return true
  }, [])

  /**
   * Добавляет стандартные текстовые сообщения в общую историю чата.
   */
  const handleStandardMessage = useCallback((
    message: ParsedIrcMessage,
    currentUserLogin: string,
    currentChannel: string | null,
  ): ParsedIrcMessage | undefined => {
    const isUserstate = message.command === TwitchIrcCommand.USER_STATE
    const isPrivmsg = message.command === TwitchIrcCommand.PRIV_MSG

    if (!isUserstate && !isPrivmsg) return undefined

    let savedText: string | null | undefined = null
    const enrichedTags = { ...message.tags }

    if (isUserstate) {
      const pendingTexts = pendingTextsRef.current
      savedText = pendingTexts ? pendingTexts.shift() : null

      if (!savedText) return undefined

      // Динамически вычисляем роли, если теги badges отсутствуют в USER_STATE быстрых ответов
      if (!enrichedTags.badges) {
        const cleanChannel = currentChannel?.toLowerCase().replace('#', '')
        const isCurrentBroadcaster = cleanChannel && currentUserLogin.toLowerCase() === cleanChannel

        if (isCurrentBroadcaster) {
          // Если авторизован стример — даем роли стримера и модератора
          enrichedTags.badges = 'broadcaster/1,moderator/1'
        } else {
          // Если авторизован модератор — даем только роль модератора
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
      command: TwitchIrcCommand.PRIV_MSG,
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
      if (nextHistory.length > MAX_MESSAGES) {
        return nextHistory.slice(nextHistory.length - MAX_MESSAGES)
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
