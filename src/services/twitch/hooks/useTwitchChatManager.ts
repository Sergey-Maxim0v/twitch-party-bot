import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { useTwitchPendingMessages } from './useTwitchPendingMessages.ts'
import { useTwitchChatHistory } from './useTwitchChatHistory.ts'
import { useTwitchChannelChange } from './useTwitchChannelChange.ts'
import { useChatAccessFacts } from './useChatAccessFacts.ts'
import { updateChatAccess } from '../utils/updateChatAccess.ts'
import { createMessageEmitter, type MessageCallback } from '../utils/createMessageEmitter.ts'
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
  const [commandEmitter] = useState(() => createMessageEmitter())

  const subscribeToChatCommands = useCallback(
    (handler: MessageCallback) => commandEmitter.subscribe(handler),
    [commandEmitter],
  )

  const { handleSocketActivity } = useTwitchHeartbeat()

  const { pendingMessagesRef, clearChatTimeout, startChatTimeout, registerPendingMessage, clearPendingMessages } = useTwitchPendingMessages()

  const client = socketContext?.getClient?.() ?? null

  const { factsRef, resetFacts, syncStatus } = useChatAccessFacts({
    client,
    updateChatAccessStatus: socketContext?.updateChatAccessStatus,
  })

  const { messages, handleModerationAndEvents, handleStandardMessage } = useTwitchChatHistory({
    client,
    pendingMessagesRef,
  })

  const currentUserLogin = session?.login?.toLowerCase() ?? TWITCH_CHAT_FALLBACK_LOGIN

  /**
   * Отправляет сообщение в чат и регистрирует его для подтверждения USERSTATE.
   *
   * Недоставка после отправки — нет подтверждения, переполнение очереди,
   * разрыв соединения — попадает в журнал приложения.
   *
   * @returns `true`, если сообщение передано в сокет.
   */
  const sendChatMessage = useCallback((message: string, options?: SendChatMessageOptions): boolean => {
    const handleFailure = (reason: string): void => {
      if (options?.onFailed) {
        options.onFailed(reason)
        return
      }

      pushLog({
        message: `Не удалось отправить сообщение в чат: ${reason}.`,
        status: APP_LOG_STATUSES.ERROR,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername: APP_LOG_TWITCH_ACTOR,
      })
    }

    const fail = (reason: string): false => {
      handleFailure(reason)

      return false
    }

    if (!socketContext || !client) {
      return fail(CHAT_SEND_FAIL_REASONS.NOT_INITIALIZED)
    }

    if (!client.sendMessage(message)) {
      return fail(CHAT_SEND_FAIL_REASONS.SOCKET_CLOSED)
    }

    registerPendingMessage(message, { ...options, onFailed: handleFailure })

    return true
  }, [registerPendingMessage, socketContext, client, pushLog])

  // Смена канала сбрасывает очередь подтверждения: подтверждения от прежнего канала не придут
  useTwitchChannelChange(client, () => {
    clearPendingMessages(CHAT_SEND_FAIL_REASONS.CHANNEL_CHANGED)
  })

  // Обрыв и переподключение сбрасывают очередь подтверждения: подтверждения от прежнего
  // соединения не придут. Обрыв также сбрасывает таймер ограничений и факты доступа:
  // просроченный таймер не должен воскрешать статус после обрыва или реконнекта
  useEffect(() => {
    if (!client) return

    return client.onStatusChange((status: ConnectionStatus) => {
      const isConnectionLost = status === SOCKET_CONNECTION_STATUSES.DISCONNECTED
        || status === SOCKET_CONNECTION_STATUSES.FAILED
      const isConnectionRestarted = status === SOCKET_CONNECTION_STATUSES.CONNECTING

      if (!isConnectionLost && !isConnectionRestarted) return

      if (isConnectionLost) {
        clearChatTimeout()
        resetFacts()
        clearPendingMessages(CHAT_SEND_FAIL_REASONS.SOCKET_CLOSED)
        return
      }

      clearPendingMessages(CHAT_SEND_FAIL_REASONS.CONNECTION_RESTARTED)
    })
  }, [client, clearChatTimeout, resetFacts, clearPendingMessages])

  /**
   * Обрабатывает входящее IRC-сообщение.
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
    handleSocketActivity(message.command)

    updateChatAccess({
      message,
      currentUserLogin,
      pendingMessagesRef,
      factsRef,
      clearChatTimeout,
      startChatTimeout,
      syncStatus,
      pushLog,
    })

    if (handleModerationAndEvents(message)) return

    const processedMessage = handleStandardMessage(message, currentUserLogin, client?.currentChannel ?? null)

    if (!processedMessage || processedMessage.command !== TWITCH_IRC_COMMANDS.PRIV_MSG) return

    commandEmitter.emit(processedMessage)
  }, [
    commandEmitter,
    handleSocketActivity,
    handleModerationAndEvents,
    handleStandardMessage,
    currentUserLogin,
    client?.currentChannel,
    pendingMessagesRef,
    factsRef,
    clearChatTimeout,
    startChatTimeout,
    syncStatus,
    pushLog,
  ])

  // Синхронизируем ref до того, как браузер доставит следующее сообщение.
  const incomingMessageRef = useRef(handleIncomingMessage)

  useLayoutEffect(() => {
    incomingMessageRef.current = handleIncomingMessage
  }, [handleIncomingMessage])

  const stableSubscriptionCallback = useCallback((message: ParsedIrcMessage) => {
    incomingMessageRef.current(message)
  }, [])

  useTwitchSubscription(stableSubscriptionCallback)

  return {
    messages,
    sendChatMessage,
    subscribeToChatCommands,
  }
}
