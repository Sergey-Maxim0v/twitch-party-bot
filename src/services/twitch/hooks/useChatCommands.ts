import { useCallback } from 'react'
import { useQueueSettings } from '../../../features/queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../../../features/queue/hooks/useQueue.ts'
import { LOG_SOURCE } from '../../../features/app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE } from '../../../features/queue/types.ts'

interface CommandSenderContext {
  userId: string
  username: string
  displayedUsername: string
  isBroadcaster: boolean
  isMod: boolean
  isVip: boolean
  isSubscriber: boolean
}

/**
 * Хук обработки чат-команд Twitch и внутренних команд приложения.
 */
export const useChatCommands = () => {
  const { settings, updateSettings } = useQueueSettings()
  const {
    activeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearFutureQueue,
  } = useQueue()

  const { commands } = settings

  /**
   * Функция обработки конкретной команды.
   * Принимает сырой текст и контекст пользователя, выполнившего команду.
   */
  const processCommand = useCallback((text: string, senderContext: CommandSenderContext) => {
    const trimmedText = text.trim()
    if (!trimmedText.startsWith('!')) return

    const parts = trimmedText.split(/\s+/)
    const commandName = parts[0]
    const commandArg = parts.slice(1).join(' ')

    const isModeratorOrStreamer = senderContext.isBroadcaster || senderContext.isMod

    const hasAccess = (isModeratorOnly: boolean) => {
      if (!isModeratorOnly) return true
      return isModeratorOrStreamer
    }

    const { userId, username, displayedUsername, isSubscriber, isVip } = senderContext

    // 1. Команда JOIN
    if (commandName === commands.join.name) {
      if (!hasAccess(commands.join.isModeratorOnly)) return

      addPlayerToQueue({
        playerData: {
          userId,
          username,
          displayedUsername,
          rawMessage: trimmedText,
          playerSource: QUEUE_PLAYER_SOURCE.USER_CMD,
          isModerator: isModeratorOrStreamer,
          isSubscriber,
          isVip,
        },
        source: LOG_SOURCE.CHAT_USER,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 2. Команда LEAVE
    if (commandName === commands.leave.name) {
      if (!hasAccess(commands.leave.isModeratorOnly)) return

      removePlayerFromAllQueues({
        userId,
        username,
        source: LOG_SOURCE.CHAT_USER,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 3. Команда SHOW
    if (commandName === commands.show.name) {
      if (!hasAccess(commands.show.isModeratorOnly)) return

      let messageText

      if (activeQueue.length) {
        messageText = 'Текущая очередь: ' +
            activeQueue.map((player, index) =>
              (index + 1) + '. @' + (player.displayedUsername ?? player.username)).join(', ')
      } else {
        messageText = 'Очередь пуста'
      }

      // Возвращаем текст ответа для отправки в чат внешним диспетчером
      return messageText
    }

    // 4. Команда ADD
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
          rawMessage: trimmedText,
          playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
          isModerator: false,
          isSubscriber: false,
          isVip: false,
        },
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 5. Команда DELETE
    if (commandName === commands.delete.name) {
      if (!hasAccess(commands.delete.isModeratorOnly)) return
      if (!commandArg) return

      const targetUsername = commandArg.replace(/^@/, '').trim().toLowerCase()
      if (!targetUsername) return

      removePlayerFromAllQueues({
        userId: targetUsername,
        username: targetUsername,
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // 6. Команда CLEAR
    if (commandName === commands.clear.name) {
      if (!hasAccess(commands.clear.isModeratorOnly)) return

      clearActiveQueue({
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername: displayedUsername,
      })

      clearFutureQueue({
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername: displayedUsername,
      })
      return
    }

    // 7. Команда START
    if (commandName === commands.start.name) {
      if (!hasAccess(commands.start.isModeratorOnly)) return

      updateSettings({ isQueueOpen: true })
      return
    }

    // 8. Команда STOP
    if (commandName === commands.stop.name) {
      if (!hasAccess(commands.stop.isModeratorOnly)) return

      updateSettings({ isQueueOpen: false })
      return
    }

  }, [
    commands,
    activeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearFutureQueue,
    updateSettings,
  ])

  return { processCommand }
}
