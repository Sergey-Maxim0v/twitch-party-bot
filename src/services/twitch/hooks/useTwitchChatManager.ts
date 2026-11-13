import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { useTwitchPendingMessages } from './useTwitchPendingMessages.ts'
import { useTwitchChatHistory } from './useTwitchChatHistory.ts'
import { updateChatAccess, type ChatAccessSnapshot } from '../utils/updateChatAccess.ts'
import { rejectPendingMessages } from '../utils/rejectPendingMessages.ts'
import { clearChatTimeout } from '../utils/clearChatTimeout.ts'
import { useTwitchSubscription } from './useTwitchSubscription.ts'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { useTwitchHeartbeat } from './useTwitchHeartbeat.ts'
import {
  CHAT_SEND_FAIL_REASONS,
  TWITCH_CHAT_FALLBACK_LOGIN,
  TWITCH_IRC_COMMANDS,
} from '../../../constants/twitch.constants.ts'
import {
  SOCKET_CONNECTION_STATUSES,
  TWITCH_CHAT_ACCESS_STATUSES,
  type ChatAccessStatus,
  type ConnectionStatus,
} from '../../socket/types.ts'
import type { ParsedIrcMessage, SendChatMessageOptions } from '../types.ts'
import { useAppLogs } from '../../../features/app-logs/hooks/useAppLogs.ts'
import { APP_LOG_SOURCES, APP_LOG_STATUSES } from '../../../features/app-logs/types.ts'
import { APP_LOG_TWITCH_ACTOR } from '../../../constants/app-logs.constants.ts'

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

  const chatAccessStatus = socketContext?.chatAccessStatus ?? TWITCH_CHAT_ACCESS_STATUSES.OFFLINE
  const chatAccessStatusRef = useRef<ChatAccessStatus>(chatAccessStatus)

  const { handleSocketActivity } = useTwitchHeartbeat()

  const { pendingMessagesRef, timeoutTimerRef, registerPendingMessage } = useTwitchPendingMessages()

  const client = socketContext?.getClient?.() ?? null

  const { messages, handleModerationAndEvents, handleStandardMessage } = useTwitchChatHistory({
    client,
    pendingMessagesRef,
    roomStateTagsRef,
  })

  const currentUserLogin = session?.login?.toLowerCase() ?? TWITCH_CHAT_FALLBACK_LOGIN

  // Статус доступа нужен за пределами цикла рендера: таймер снятия таймаута
  // проверяет его в момент срабатывания
  useEffect(() => {
    chatAccessStatusRef.current = chatAccessStatus
  }, [chatAccessStatus])

  /**
   * Собирает актуальный снимок состояния доступа к чату.
   * Значения читаются в момент вызова, поэтому не устаревают между рендерами.
   */
  const getChatAccessSnapshot = useCallback((): ChatAccessSnapshot => ({
    status: chatAccessStatusRef.current,
    isConnectionActive: client?.status === SOCKET_CONNECTION_STATUSES.CONNECTED,
    roomTags: roomStateTagsRef.current,
  }), [client])

  /**
   * Отправляет сообщение в чат и регистрирует его для подтверждения USERSTATE.
   *
   * @returns `true`, если сообщение передано в сокет.
   */
  const sendChatMessage = useCallback((message: string, options?: SendChatMessageOptions): boolean => {
    const fail = (reason: string): false => {
      if (options?.onFailed) {
        options.onFailed(reason)
        return false
      }

      pushLog({
        message: `Не удалось отправить сообщение в чат: ${reason}.`,
        status: APP_LOG_STATUSES.ERROR,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: APP_LOG_TWITCH_ACTOR,
      })

      return false
    }

    if (!socketContext || !client) {
      return fail(CHAT_SEND_FAIL_REASONS.NOT_INITIALIZED)
    }

    if (!client.sendMessage(message)) {
      return fail(CHAT_SEND_FAIL_REASONS.SOCKET_CLOSED)
    }

    registerPendingMessage(message, options)

    return true
  }, [registerPendingMessage, socketContext, client, pushLog])

  // Потеря соединения сбрасывает очередь подтверждения, таймер ограничений и теги комнаты:
  // ответы сервера не должны подтверждать сообщения до обрыва, а просроченный таймер
  // не должен воскрешать статус доступа после обрыва или реконнекта
  useEffect(() => {
    if (!client) return

    return client.onStatusChange((status: ConnectionStatus) => {
      const isConnectionLost = status === SOCKET_CONNECTION_STATUSES.DISCONNECTED
        || status === SOCKET_CONNECTION_STATUSES.FAILED

      if (!isConnectionLost) return

      clearChatTimeout(timeoutTimerRef)
      roomStateTagsRef.current = {}
      rejectPendingMessages(pendingMessagesRef, CHAT_SEND_FAIL_REASONS.SOCKET_CLOSED, true)
    })
  }, [client, pendingMessagesRef, timeoutTimerRef])

  /**
   * Обрабатывает входящее IRC-сообщение.
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

    if (message.command === TWITCH_IRC_COMMANDS.ROOM_STATE) {
      roomStateTagsRef.current = {
        ...roomStateTagsRef.current,
        ...(message.tags || {}),
      }
    }

    if (socketContext?.updateChatAccessStatus) {
      updateChatAccess({
        message,
        currentUserLogin,
        pendingMessagesRef,
        timeoutTimerRef,
        updateChatAccessStatus: socketContext.updateChatAccessStatus,
        getChatAccessSnapshot,
        pushLog,
      })
    }

    const isEventOrMod = handleModerationAndEvents(message)
    if (isEventOrMod) {
      return
    }

    const processedMessage = handleStandardMessage(message, currentUserLogin, client?.currentChannel ?? null)

    if (!processedMessage || processedMessage.command !== TWITCH_IRC_COMMANDS.PRIV_MSG) return

    const isCommand = processedMessage.text.trim().startsWith('!')
    const isFromOtherUser = processedMessage.user.nick !== currentUserLogin

    if (isCommand || isFromOtherUser) {
      setLastMessage(processedMessage)
    }
  }, [
    handleSocketActivity,
    socketContext,
    handleModerationAndEvents,
    handleStandardMessage,
    currentUserLogin,
    client?.currentChannel,
    pendingMessagesRef,
    timeoutTimerRef,
    getChatAccessSnapshot,
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
