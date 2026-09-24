import { useEffect, useRef } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE } from '../types.ts'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'

/**
 * Хук обработки чат-команд Twitch.
 */
export const useChatCommands = () => {
  const { sendMessage } = useSocketContext()
  const { settings, updateSettings } = useQueueSettings()
  const { messages, sendChatMessage } = useTwitchChat()
  const {
    activeQueue,
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearFutureQueue,
  } = useQueue()

  const { commands } = settings

  // Реф для хранения ID последнего успешно обработанного сообщения
  const lastProcessedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!messages.length) return

    // Забираем самый последний элемент из конца массива входящих сообщений
    const msg = messages[messages.length - 1]

    // Строгая защита от дублирования команд при рендерах
    if (msg.id === lastProcessedIdRef.current) return
    lastProcessedIdRef.current = msg.id

    // Игнорируем системные сообщения и сервисные события канала
    if (msg.isSystem || msg.isChannelEvent) return
    
    // ФИЛЬТР: Если это не команда (не начинается с !) выходим
    if (!msg.text || !msg.text.trim().startsWith('!')) return

    // Вычисляем роли на основе бейджей Twitch IRC
    const badges = msg.tags.badges || ''
    const isBroadcaster = badges.includes('broadcaster/')
    const isMod = badges.includes('moderator/') || msg.tags.mod === '1'
    const isVip = badges.includes('vip/')
    const isSubscriber = badges.includes('subscriber/') || msg.tags.subscriber === '1'

    const isModeratorOrStreamer = isBroadcaster || isMod

    // Хелпер для проверки прав доступа к команде бота
    const hasAccess = (isModeratorOnly: boolean) => {
      if (!isModeratorOnly) return true
      return isModeratorOrStreamer
    }

    const trimmedText = msg.text.trim()
    const parts = trimmedText.split(/\s+/)
    const commandName = parts[0] // Сама строка команды (например, !join)
    const commandArg = parts.slice(1).join(' ') // Аргументы команды (например, никнейм)

    // Уникальный ID аккаунта в Twitch из тегов
    const userId = msg.tags['user-id'] || msg.user
    const actorUsername = msg.displayName || msg.user

    // 1. Команда JOIN (Игрок самостоятельно заходит в очередь)
    if (commandName === commands.join.name) {
      if (!hasAccess(commands.join.isModeratorOnly)) return

      addPlayerToQueue({
        playerData: {
          userId,
          username: msg.user,
          displayedUsername: actorUsername,
          rawMessage: msg.text,
          playerSource: QUEUE_PLAYER_SOURCE.USER_CMD,
          isModerator: isModeratorOrStreamer,
          isSubscriber,
          isVip,
        },
        source: LOG_SOURCE.CHAT_USER,
        actorUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 2. Команда LEAVE (Игрок самостоятельно выходит из всех очередей)
    if (commandName === commands.leave.name) {
      if (!hasAccess(commands.leave.isModeratorOnly)) return

      removePlayerFromAllQueues({
        userId,
        username: msg.user,
        source: LOG_SOURCE.CHAT_USER,
        actorUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 3. Команда SHOW (Отправить в чат информацию о текущей очереди)
    if (commandName === commands.show.name) {
      if (!hasAccess(commands.show.isModeratorOnly)) return

      let messageText

      if(activeQueue.length) {
        messageText = 'Текущая очередь: ' +
            activeQueue.map((player, index) =>
              (index + 1) + '. @' + (player.displayedUsername ?? player.username)).join(', ')

      } else {
        messageText = 'Очередь пуста'
      }

      sendChatMessage(messageText)
      return
    }

    // 4. Команда ADD (Модератор принудительно добавляет другого игрока по никнейму из чата)
    if (commandName === commands.add.name) {
      if (!hasAccess(commands.add.isModeratorOnly)) return
      if (!commandArg) return

      const targetUsername = commandArg.replace(/^@/, '').trim()
      if (!targetUsername) return

      addPlayerToQueue({
        playerData: {
          userId: targetUsername.toLowerCase(),
          username: targetUsername.toLowerCase(),
          displayedUsername: targetUsername,
          rawMessage: msg.text,
          playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
          isModerator: false,
          isSubscriber: false,
          isVip: false,
        },
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 5. Команда DELETE (Модератор принудительно удаляет игрока из всех очередей)
    if (commandName === commands.delete.name) {
      if (!hasAccess(commands.delete.isModeratorOnly)) return
      if (!commandArg) return

      const targetUsername = commandArg.replace(/^@/, '').trim().toLowerCase()
      if (!targetUsername) return

      removePlayerFromAllQueues({
        userId: targetUsername,
        username: targetUsername,
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 6. Команда CLEAR (Модератор полностью очищает текущую активную и будущую очереди)
    if (commandName === commands.clear.name) {
      if (!hasAccess(commands.clear.isModeratorOnly)) return

      clearActiveQueue({
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername,
      })

      clearFutureQueue({
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername,
      })
      return
    }

    // 7. Команда START (Модератор открывает запись в очередь)
    if (commandName === commands.start.name) {
      if (!hasAccess(commands.start.isModeratorOnly)) return

      updateSettings({ isQueueOpen: true })
      return
    }

    // 8. Команда STOP (Модератор закрывает запись в очередь)
    if (commandName === commands.stop.name) {
      if (!hasAccess(commands.stop.isModeratorOnly)) return

      updateSettings({ isQueueOpen: false })
      return
    }

  }, [messages,
    commands,
    activeQueue,
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearFutureQueue,
    updateSettings,
    sendMessage,
    sendChatMessage],
  )
}
