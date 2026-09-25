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
    setIsQueueOpen,
    activeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearFutureQueue,
  } = useQueue()

  const { commands } = settings

  useEffect(() => {
    // 1. Быстрые проверки на валидность сообщения
    if (!lastMessage?.text) return
    const trimmedText = lastMessage.text.trim()
    if (!trimmedText.startsWith('!')) return

    // 2. Формируем контекст пользователя из бейджей
    const badges = lastMessage.tags.badges ? lastMessage.tags.badges.split(',') : []
    const isBroadcaster = badges.some(b => b.startsWith('broadcaster/'))
    const isMod = badges.some(b => b.startsWith('moderator/')) || lastMessage.tags.mod === '1'
    const isModeratorOrStreamer = isBroadcaster || isMod

    // 3. Парсим команду
    const parts = trimmedText.split(/\s+/)
    const commandName = parts[0]
    const commandArg = parts.slice(1).join(' ')

    const hasAccess = (isModeratorOnly: boolean) => {
      if (!isModeratorOnly) return true
      return isModeratorOrStreamer
    }

    const userId = lastMessage.user
    const displayedUsername = lastMessage.displayName ?? ''
    const username = displayedUsername.toLowerCase()

    const isSubscriber = lastMessage.tags.subscriber === '1' ||
        badges.some(b => b.startsWith('subscriber/')) ||
        badges.some(b => b.startsWith('founder/'))

    const isVip = lastMessage.tags.vip === '1' ||
        badges.some(b => b.startsWith('vip/'))

    // 4. Обработка команд
    // JOIN
    if (commandName === commands.join.name) {
      if (!hasAccess(commands.join.isModeratorOnly)) return
      addPlayerToQueue({
        playerData: {
          userId, username, displayedUsername,
          rawMessage: trimmedText,
          playerSource: QUEUE_PLAYER_SOURCE.USER_CMD,
          isModerator: isModeratorOrStreamer,
          isSubscriber, isVip,
        },
        source: LOG_SOURCE.CHAT_USER,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // LEAVE
    if (commandName === commands.leave.name) {
      if (!hasAccess(commands.leave.isModeratorOnly)) return
      removePlayerFromAllQueues({
        userId, username,
        source: LOG_SOURCE.CHAT_USER,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // SHOW
    if (commandName === commands.show.name) {
      if (!hasAccess(commands.show.isModeratorOnly)) return
      const queueMessage = activeQueue.length
        ? 'Текущая очередь: ' + activeQueue.map((player, index) => `${index + 1}. @${player.displayedUsername ?? player.username}`).join(', ')
        : 'Очередь пуста'
      sendChatMessage(queueMessage)
      return
    }

    // ADD
    if (commandName === commands.add.name) {
      if (!hasAccess(commands.add.isModeratorOnly) || !commandArg) return
      const targetUsername = commandArg.replace(/^@/, '').trim()
      if (!targetUsername) return

      addPlayerToQueue({
        playerData: {
          userId: targetUsername.toLowerCase(),
          username: targetUsername.toLowerCase(),
          displayedUsername: targetUsername,
          rawMessage: trimmedText,
          playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
          isModerator: false, isSubscriber: false, isVip: false,
        },
        source: LOG_SOURCE.CHAT_MODERATOR,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
      return
    }

    // DELETE
    if (commandName === commands.delete.name) {
      if (!hasAccess(commands.delete.isModeratorOnly) || !commandArg) return
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

    // CLEAR
    if (commandName === commands.clear.name) {
      if (!hasAccess(commands.clear.isModeratorOnly)) return
      clearActiveQueue({ source: LOG_SOURCE.CHAT_MODERATOR, actorUsername: displayedUsername })
      clearFutureQueue({ source: LOG_SOURCE.CHAT_MODERATOR, actorUsername: displayedUsername })
      return
    }

    // START
    if (commandName === commands.start.name) {
      if (!hasAccess(commands.start.isModeratorOnly)) return
      setIsQueueOpen(true)
      return
    }

    // STOP
    if (commandName === commands.stop.name) {
      if (!hasAccess(commands.stop.isModeratorOnly)) return
      setIsQueueOpen(false)
      return
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]) // Реагируем ТОЛЬКО на приход нового сообщения
}
