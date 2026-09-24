import { useCallback } from 'react'
import type { ParsedIrcMessage } from '../utils/parseIrcMessage.ts'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import { useTwitchPendingMessages } from './useTwitchPendingMessages.ts'
import { useTwitchChatHistory } from './useTwitchChatHistory.ts'
import { updateChatAccess } from '../utils/updateChatAccess.ts'
import { useTwitchSubscription } from './useTwitchSubscription.ts'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'
import { useTwitchHeartbeat } from './useTwitchHeartbeat.ts'
import { TwitchIrcCommand } from '../config.ts'
import { useChatCommands } from './useChatCommands.ts'
import { useQueueSettings } from '../../../features/queue-settings/hooks/useQueueSettings.ts'

/**
 * Единый хук управления состоянием чата Twitch.
 * Выступает диспетчером между историей сообщений и очередью отправки.
 */
export const useTwitchChatManager = () => {
  const socketContext = useSocketContext()
  const { session } = useAuth()
  const { settings } = useQueueSettings()

  // Подключаем функционал обработки чат-команд
  const { processCommand } = useChatCommands()

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
   *  Функция отправки сообщения в Twitch чат
   */
  const sendChatMessage = useCallback((message: string) => {
    if (socketContext && socketContext.sendMessage && registerPendingMessage) {
      registerPendingMessage(message)
      socketContext.sendMessage(message)

      // Если отправленное из инпута приложения сообщение является командой,
      // выполняем её локально от лица стримера (Broadcaster)
      if (message.trim().startsWith('!')) {
        const streamResponse = processCommand(message, {
          userId: currentUserLogin ?? 'broadcaster',
          username: currentUserLogin ?? 'broadcaster',
          displayedUsername: session?.login ?? 'Broadcaster',
          isBroadcaster: true,
          isMod: false,
          isVip: false,
          isSubscriber: false,
        })

        // Если команда подразумевала текстовый ответ (например, !show), отправляем его в чат
        if (streamResponse && socketContext?.sendMessage && settings.chatNotificationPermissions.allowSending) {
          socketContext.sendMessage(streamResponse)
        }
      }
    }
  }, [registerPendingMessage, socketContext, processCommand, currentUserLogin, session?.login, settings])

  /**
   * Главный диспетчер обработки каждого входящего IRC-сообщения
   */
  const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
    // 0. Регистрируем сетевую активность для сброса таймеров Heartbeat
    handleSocketActivity(message.command)

    // 1. Вычисляем права доступа и управляем состоянием блокировок
    if (socketContext && socketContext.updateChatAccessStatus) {
      updateChatAccess({
        message,
        currentUserLogin,
        pendingTextsRef,
        timeoutTimerRef,
        updateChatAccessStatus: socketContext.updateChatAccessStatus,
      })
    }

    // 2. Обрабатываем модераторские действия и системные логи
    const isEventOrMod = handleModerationAndEvents(message)
    if (isEventOrMod) {
      return
    }

    // 3. Обрабатываем стандартные и подтвержденные текстовые сообщения
    handleStandardMessage(message)

    // 4. Если это текстовое сообщение (PRIVMSG) и оно является чат-командой
    if (message.command === TwitchIrcCommand.PRIV_MSG && message.text?.trim().startsWith('!')) {
      const badges = message.tags.badges || ''

      const chatResponse = processCommand(message.text, {
        userId: message.tags['user-id'] || message.user,
        username: message.user,
        displayedUsername: message.displayName || message.user,
        isBroadcaster: badges.includes('broadcaster/'),
        isMod: badges.includes('moderator/') || message.tags.mod === '1',
        isVip: badges.includes('vip/'),
        isSubscriber: badges.includes('subscriber/') || message.tags.subscriber === '1',
      })

      // Если команда вернула текстовый ответ (например, !show), отправляем его в чат через сокет
      if (chatResponse && socketContext?.sendMessage && settings.chatNotificationPermissions.allowSending) {
        socketContext.sendMessage(chatResponse)
      }
    }
  }, [
    currentUserLogin,
    socketContext,
    handleModerationAndEvents,
    handleStandardMessage,
    pendingTextsRef,
    timeoutTimerRef,
    handleSocketActivity,
    processCommand,
    settings,
  ])

  // Автоматически подписываемся на сырой IRC-поток
  useTwitchSubscription(handleIncomingMessage)

  return {
    messages,
    sendChatMessage,
  }
}
