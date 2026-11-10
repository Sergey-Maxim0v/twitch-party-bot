import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { useTwitchPendingMessages } from './useTwitchPendingMessages.ts'
import { useTwitchChatHistory } from './useTwitchChatHistory.ts'
import { updateChatAccess } from '../utils/updateChatAccess.ts'
import { useTwitchSubscription } from './useTwitchSubscription.ts'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { useTwitchHeartbeat } from './useTwitchHeartbeat.ts'
import { TWITCH_IRC_COMMANDS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'
import { useAppLogs } from '../../../features/app-logs/hooks/useAppLogs.ts'

/**
 * Единый хук управления состоянием чата Twitch.
 * Выступает диспетчером между историей сообщений и очередью отправки.
 */
export const useTwitchChatManager = () => {
  const socketContext = useSocketContext()
  const { session } = useAuth()
  const { pushLog } = useAppLogs()
  const [lastMessage, setLastMessage] = useState<ParsedIrcMessage | null>(null)

  const roomStateTagsRef = useRef<Record<string, string>>({})

  const { handleSocketActivity } = useTwitchHeartbeat()

  const { pendingTextsRef, timeoutTimerRef, registerPendingMessage } = useTwitchPendingMessages()

  const client = socketContext?.getClient?.() ?? null

  const { messages, handleModerationAndEvents, handleStandardMessage } = useTwitchChatHistory({
    client,
    pendingTextsRef,
    roomStateTagsRef,
  })

  const currentUserLogin = session?.login?.toLowerCase() ?? 'broadcaster'

  /**
   * Отправляет сообщение в Twitch-чат и ставит его в очередь ожидания USER_STATE.
   */
  const sendChatMessage = useCallback((message: string) => {
    if (socketContext && !!socketContext.sendMessage && registerPendingMessage && client) {
      registerPendingMessage(message)
      client.sendMessage(message)
    }
  }, [registerPendingMessage, socketContext, client])

  /**
   * Главный диспетчер обработки каждого входящего IRC-сообщения.
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
    if (message.command === TWITCH_IRC_COMMANDS.PRIV_MSG) {
      setLastMessage(prevMessage => {
        const currentId = message.tags?.id
        const prevId = prevMessage?.tags?.id

        if (currentId && currentId === prevId) {
          return prevMessage
        }

        return message
      })
    }

    handleSocketActivity(message.command)

    if (socketContext && socketContext.updateChatAccessStatus) {
      if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
        roomStateTagsRef.current = {
          ...roomStateTagsRef.current,
          ...(message.tags || {}),
        }
      }

      updateChatAccess({
        message,
        currentUserLogin,
        pendingTextsRef,
        timeoutTimerRef,
        updateChatAccessStatus: socketContext.updateChatAccessStatus,
        pushLog,
        currentRoomTags: roomStateTagsRef.current,
      })
    }

    const isEventOrMod = handleModerationAndEvents(message)
    if (isEventOrMod) {
      return
    }

    const processedMessage = handleStandardMessage(message, currentUserLogin, client?.currentChannel ?? null)

    if (processedMessage && processedMessage.command === TWITCH_IRC_COMMANDS.PRIV_MSG) {
      const isCommand = processedMessage.text.trim().startsWith('!')
      const isFromOtherUser = processedMessage.user.nick !== currentUserLogin

      if (isCommand || isFromOtherUser) {
        setLastMessage(processedMessage)
      }
    }
  }, [
    handleSocketActivity,
    socketContext,
    handleModerationAndEvents,
    handleStandardMessage,
    currentUserLogin,
    client?.currentChannel,
    pendingTextsRef,
    timeoutTimerRef,
    pushLog,
  ])

  // Стабильная ссылка защищает от переподписок при батчинге пачек сообщений
  const incomingMessageRef = useRef(handleIncomingMessage)

  useEffect(() => {
    incomingMessageRef.current = handleIncomingMessage
  }, [handleIncomingMessage])

  const stableSubscriptionCallback = useCallback((message: ParsedIrcMessage) => {
    incomingMessageRef.current(message)
  }, [])

  useTwitchSubscription(stableSubscriptionCallback)

  return {
    messages,
    sendChatMessage,
    lastMessage,
  }
}
