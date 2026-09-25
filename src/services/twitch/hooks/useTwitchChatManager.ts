import { useCallback, useState } from 'react'
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

  const currentUserLogin = session?.login?.toLowerCase()

  /**
   * Функция отправки сообщения в Twitch чат
   */
  const sendChatMessage = useCallback((message: string) => {
    if (socketContext && socketContext.sendMessage && registerPendingMessage) {
      registerPendingMessage(message)
      socketContext.sendMessage(message)
    }
  }, [registerPendingMessage, socketContext])

  /**
   * Главный диспетчер обработки каждого входящего IRC-сообщения
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
    // 0. Обновляем стейт последнего полученного сообщения (для стандартных входящих сообщений)
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
    const processedMessage = handleStandardMessage(message)

    // Если это было наше отправленное сообщение (USER_STATE трансформированный в PRIV_MSG),
    // записываем его в lastMessage
    if (processedMessage && processedMessage.command === TwitchIrcCommand.PRIV_MSG) {
      setLastMessage(processedMessage)
    }
  }, [
    currentUserLogin,
    socketContext,
    handleModerationAndEvents,
    handleStandardMessage,
    pendingTextsRef,
    timeoutTimerRef,
    handleSocketActivity,
  ])

  // Автоматически подписываемся на сырой IRC-поток
  useTwitchSubscription(handleIncomingMessage)

  return {
    messages,
    sendChatMessage,
    lastMessage,
  }
}
