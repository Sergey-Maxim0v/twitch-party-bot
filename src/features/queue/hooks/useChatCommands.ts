import { useEffect } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { TWITCH_CHAT_MENTION_REGEX, TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'

/**
 * Отбрасывает упоминание и пробелы вокруг аргумента команды чата.
 */
const parseCommandTarget = (argument: string): string => argument.trim().replace(TWITCH_CHAT_MENTION_REGEX, '').trim()

/**
 * Обрабатывает команды из чата Twitch: вступление в очередь, выход,
 * показ статуса, очистку списков и управление составом.
 */
export const useChatCommands = () => {
  const { settings } = useQueueSettings()
  const { lastMessage } = useTwitchChat()
  const { sendCurrentQueueStatus, sendMessage } = useQueueNotification()
  const {
    openQueue,
    closeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearWaitingQueue,
    finishActiveQueue,
  } = useQueue()

  const { commands } = settings

  useEffect(() => {
    if (!lastMessage?.text) return
    const trimmedText = lastMessage.text.trim()
    if (!trimmedText.startsWith('!')) return

    const isModeratorOrStreamer = lastMessage.user.isBroadcaster || lastMessage.user.isModerator

    const parts = trimmedText.split(/\s+/)
    const commandName = parts[0]
    const commandArg = parts.slice(1).join(' ')

    const hasAccess = (isModeratorOnly: boolean): boolean => !isModeratorOnly || Boolean(isModeratorOrStreamer)

    const userId = lastMessage.user.userId ?? ''
    const username = lastMessage.user.nick
    const displayedUsername = lastMessage.user.displayName ?? lastMessage.user.nick
    const actorUsername = displayedUsername
    const isModerator = isModeratorOrStreamer
    const isSubscriber = lastMessage.user.isSubscriber
    const isVip = lastMessage.user.isVip
    const source = isModeratorOrStreamer ? APP_LOG_SOURCES.CHAT_MODERATOR : APP_LOG_SOURCES.CHAT_USER
    const rawMessage = trimmedText
    const rawCommand = trimmedText

    switch (commandName) {
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

      case commands.show.name: {
        if (!hasAccess(commands.show.isModeratorOnly)) return

        sendCurrentQueueStatus()
        break
      }

      case commands.add.name: {
        if (!hasAccess(commands.add.isModeratorOnly) || !commandArg) return
        const targetUsername = parseCommandTarget(commandArg)
        if (!TWITCH_LOGIN_PATTERN.test(targetUsername.toLowerCase())) return

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

      case commands.delete.name: {
        if (!hasAccess(commands.delete.isModeratorOnly) || !commandArg) return
        const targetUsername = parseCommandTarget(commandArg).toLowerCase()
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

      case commands.clear.name: {
        if (!hasAccess(commands.clear.isModeratorOnly)) return
        clearWaitingQueue({ source, actorUsername })
        clearActiveQueue({ source, actorUsername })

        sendMessage('Текущая очередь и список ожидания очищены.')
        break
      }

      case commands.start.name: {
        if (!hasAccess(commands.start.isModeratorOnly)) return
        openQueue({ source, actorUsername })
        break
      }

      case commands.stop.name: {
        if (!hasAccess(commands.stop.isModeratorOnly)) return
        closeQueue({ source, actorUsername })
        break
      }

      case commands.play.name: {
        if (!hasAccess(commands.play.isModeratorOnly)) return
        finishActiveQueue({ source, actorUsername })
        break
      }

      default:
        break
    }

    // Реагируем только на новое сообщение в чате.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])
}
