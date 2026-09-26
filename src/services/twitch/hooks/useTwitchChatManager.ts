import { useCallback, useEffect, useRef, useState } from 'react'
import type { ParsedIrcMessage } from '../utils/parseIrcMessage.ts'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { useTwitchPendingMessages } from './useTwitchPendingMessages.ts'
import { useTwitchChatHistory } from './useTwitchChatHistory.ts'
import { updateChatAccess } from '../utils/updateChatAccess.ts'
import { useTwitchSubscription } from './useTwitchSubscription.ts'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { useTwitchHeartbeat } from './useTwitchHeartbeat.ts'
import { TwitchIrcCommand } from '../config.ts'

/**
 * Единый хук управления состоянием чата Twitch.
 * Выступает диспетчером между историей сообщений и очередью отправки.
 */
export const useTwitchChatManager = () => {
  const socketContext = useSocketContext()
  const { session } = useAuth()
  const [lastMessage, setLastMessage] = useState<ParsedIrcMessage | null>(null)

  // Подключаем контроль активности сокета (Heartbeat)
  const { handleSocketActivity } = useTwitchHeartbeat()

  const { pendingTextsRef, timeoutTimerRef, registerPendingMessage } = useTwitchPendingMessages()

  const client = socketContext?.getClient?.() ?? null

  const { messages, handleModerationAndEvents, handleStandardMessage } = useTwitchChatHistory({
    client,
    pendingTextsRef,
  })

  const currentUserLogin = session?.login?.toLowerCase() ?? 'broadcaster'

  /**
   * Функция отправки сообщения в Twitch чат
   */
  const sendChatMessage = useCallback((message: string) => {
    if (socketContext && !!socketContext.sendMessage && registerPendingMessage && client) {
      registerPendingMessage(message)
      client.sendMessage(message)
    }
  }, [registerPendingMessage, socketContext, client])

  /**
   * Главный диспетчер обработки каждого входящего IRC-сообщения
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
    // 0. Обновляем стейт последнего полученного сообщения для входящих команд
    if (message.command === TwitchIrcCommand.PRIV_MSG) {
      setLastMessage(prevMessage => {
        const currentId = message.tags?.id
        const prevId = prevMessage?.tags?.id

        if (currentId && currentId === prevId) {
          return prevMessage
        }

        return message
      })
    }

    // 1. Регистрируем сетевую активность для сброса таймеров Heartbeat
    handleSocketActivity(message.command)

    // 2. Вычисляем права доступа и управляем состоянием блокировок
    if (socketContext && socketContext.updateChatAccessStatus) {
      updateChatAccess({
        message,
        currentUserLogin,
        pendingTextsRef,
        timeoutTimerRef,
        updateChatAccessStatus: socketContext.updateChatAccessStatus,
      })
    }

    // 3. Обрабатываем модераторские действия и системные логи
    const isEventOrMod = handleModerationAndEvents(message)
    if (isEventOrMod) {
      return
    }

    // 4. Обрабатываем стандартные и подтвержденные текстовые сообщения
    const processedMessage = handleStandardMessage(message, currentUserLogin, client?.currentChannel ?? null)

    // Фильтруем запись в lastMessage, чтобы автоматические ответы приложения не ломали стейт команд
    if (processedMessage && processedMessage.command === TwitchIrcCommand.PRIV_MSG) {
      const isCommand = processedMessage.text.trim().startsWith('!')
      const isFromOtherUser = processedMessage.user !== currentUserLogin

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
  ])

  // Слой стабилизации подписки: защищает от переподписок при батчинге пачек сообщений
  const incomingMessageRef = useRef(handleIncomingMessage)

  useEffect(() => {
    incomingMessageRef.current = handleIncomingMessage
  }, [handleIncomingMessage])

  const stableSubscriptionCallback = useCallback((message: ParsedIrcMessage) => {
    incomingMessageRef.current(message)
  }, [])

  // Передаем стабильную ссылку в подписку сокета
  useTwitchSubscription(stableSubscriptionCallback)

  return {
    messages,
    sendChatMessage,
    lastMessage,
  }
}
