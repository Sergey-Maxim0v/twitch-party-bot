import { useEffect } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'

export const useChatCommands = () => {
  const { settings } = useQueueSettings()
  const { lastMessage, sendChatMessage } = useTwitchChat()
  const {
    openQueue,
    closeQueue,
    activeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearWaitingQueue,
    finishActiveQueue,
  } = useQueue()

  const { commands } = settings

  useEffect(() => {
    // 1. Быстрые проверки на валидность сообщения
    if (!lastMessage?.text) return
    const trimmedText = lastMessage.text.trim()
    if (!trimmedText.startsWith('!')) return

    // 2. Формируем контекст пользователя из бейджей
    const isModeratorOrStreamer = lastMessage.user.isBroadcaster || lastMessage.user.isModerator

    // 3. Парсим команду
    const parts = trimmedText.split(/\s+/)
    const commandName = parts[0]
    const commandArg = parts.slice(1).join(' ')

    const hasAccess = (isModeratorOnly: boolean) => {
      if (!isModeratorOnly) return true
      return isModeratorOrStreamer
    }

    const userId = lastMessage.user.userId ?? ''
    const username = lastMessage.user.nick
    const displayedUsername = lastMessage.user.displayName ?? lastMessage.user.nick
    const actorUsername = displayedUsername
    const isModerator = isModeratorOrStreamer
    const isSubscriber = lastMessage.user.isSubscriber
    const isVip = lastMessage.user.isVip
    const source = isModeratorOrStreamer ? LOG_SOURCE.CHAT_MODERATOR : LOG_SOURCE.CHAT_USER
    const rawMessage = trimmedText
    const rawCommand = trimmedText

    // 4. Обработка команд через оператор switch
    switch (commandName) {
      // JOIN
      case commands.join.name: {
        if (!hasAccess(commands.join.isModeratorOnly)) return
        addPlayerToQueue({
          playerData: {
            userId,
            username,
            displayedUsername,
            rawMessage,
            playerSource: QUEUE_PLAYER_SOURCE.USER_CMD,
            isModerator,
            isSubscriber,
            isVip,
          },
          source,
          actorUsername,
          rawCommand,
        })
        break
      }

      // LEAVE
      case commands.leave.name: {
        if (!hasAccess(commands.leave.isModeratorOnly)) return
        removePlayerFromAllQueues({
          userId,
          username,
          source,
          actorUsername,
          rawCommand,
        })
        break
      }

      // SHOW
      case commands.show.name: {
        if (!hasAccess(commands.show.isModeratorOnly)) return

        const queueStatusText = `(${activeQueue.length}/${settings.maxQueueSize})`
        const queueListText = activeQueue
          .map((player, idx) => `${idx + 1}. @${player.displayedUsername ?? player.username}`)
          .join(', ')
        const queueMessage = activeQueue.length ? `Текущая очередь ${queueStatusText}: ${queueListText}` : 'Очередь пуста'

        sendChatMessage(queueMessage)
        break
      }

      // ADD
      case commands.add.name: {
        if (!hasAccess(commands.add.isModeratorOnly) || !commandArg) return
        const targetUsername = commandArg.replace(/^@/, '').trim()
        if (!targetUsername) return

        addPlayerToQueue({
          playerData: {
            userId: targetUsername,
            username: targetUsername.toLowerCase(),
            displayedUsername: targetUsername,
            rawMessage,
            playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
            isModerator: false, isSubscriber: false, isVip: false,
          },
          source,
          actorUsername,
          rawCommand,
        })
        break
      }

      // DELETE
      case commands.delete.name: {
        if (!hasAccess(commands.delete.isModeratorOnly) || !commandArg) return
        const targetUsername = commandArg.replace(/^@/, '').trim().toLowerCase()
        if (!targetUsername) return

        removePlayerFromAllQueues({
          userId: targetUsername,
          username: targetUsername,
          source,
          actorUsername,
          rawCommand,
        })
        break
      }

      // CLEAR
      case commands.clear.name: {
        if (!hasAccess(commands.clear.isModeratorOnly)) return
        clearWaitingQueue({ source, actorUsername })
        clearActiveQueue({ source, actorUsername })
        break
      }

      // START
      case commands.start.name: {
        if (!hasAccess(commands.start.isModeratorOnly)) return
        openQueue({ source, actorUsername })
        break
      }

      // STOP
      case commands.stop.name: {
        if (!hasAccess(commands.stop.isModeratorOnly)) return
        closeQueue({ source, actorUsername })
        break
      }

      // PLAY
      case commands.play.name: {
        if (!hasAccess(commands.play.isModeratorOnly)) return
        finishActiveQueue({ source, actorUsername })
        break
      }

      default:
        break
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]) // Реагируем ТОЛЬКО на приход нового сообщения
}
