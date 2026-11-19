import { useEffect } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { formatPrefixedMessage } from '../../queue-notification/utils/formatPrefixedMessage.ts'
import { QUEUE_CHAT_NOTIFICATION_MESSAGES } from '../../../constants/queue.constants.ts'
import { TWITCH_CHAT_COMMAND_SPLIT_REGEX, TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'
import { parseCommandTarget } from '../utils/parseCommandTarget.ts'

/**
 * Обрабатывает команды чата Twitch: запись, статус, очистку и управление очередями.
 * Командой считается первое слово сообщения, совпадающее с именем из настроек без учёта регистра.
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
  const commandNames = Object.values(commands).map(command => command.name.toLowerCase())

  useEffect(() => {
    if (!lastMessage?.text || lastMessage.isAutomated) return

    const trimmedText = lastMessage.text.trim()
    const [rawCommandName, ...commandArgs] = trimmedText.split(TWITCH_CHAT_COMMAND_SPLIT_REGEX)
    const commandName = rawCommandName?.toLowerCase() ?? ''
    if (!commandName || !commandNames.includes(commandName)) return

    const isModeratorOrStreamer = lastMessage.user.isBroadcaster || lastMessage.user.isModerator
    const commandArg = commandArgs.join(' ')

    const hasAccess = (isModeratorOnly: boolean): boolean => !isModeratorOnly || Boolean(isModeratorOrStreamer)

    const userId = lastMessage.user.userId ?? ''
    const username = lastMessage.user.nick
    const displayedUsername = lastMessage.user.displayName ?? lastMessage.user.nick
    const isSubscriber = lastMessage.user.isSubscriber
    const isVip = lastMessage.user.isVip
    const source = isModeratorOrStreamer ? APP_LOG_SOURCES.CHAT_MODERATOR : APP_LOG_SOURCES.CHAT_USER

    switch (commandName) {
      case commands.join.name.toLowerCase(): {
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
          source,
          actorUsername: displayedUsername,
          rawCommand: trimmedText,
        })
        break
      }

      case commands.leave.name.toLowerCase(): {
        if (!hasAccess(commands.leave.isModeratorOnly)) return
        removePlayerFromAllQueues({
          userId,
          username,
          source,
          actorUsername: displayedUsername,
          rawCommand: trimmedText,
        })
        break
      }

      case commands.show.name.toLowerCase(): {
        if (!hasAccess(commands.show.isModeratorOnly)) return
        sendCurrentQueueStatus()
        break
      }

      case commands.add.name.toLowerCase(): {
        if (!hasAccess(commands.add.isModeratorOnly) || !commandArg) return
        const targetUsername = parseCommandTarget(commandArg)
        if (!TWITCH_LOGIN_PATTERN.test(targetUsername.toLowerCase())) return

        addPlayerToQueue({
          playerData: {
            userId: targetUsername,
            username: targetUsername.toLowerCase(),
            displayedUsername: targetUsername,
            rawMessage: trimmedText,
            playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
            isModerator: false,
            isSubscriber: false,
            isVip: false,
          },
          source,
          actorUsername: displayedUsername,
          rawCommand: trimmedText,
        })
        break
      }

      case commands.delete.name.toLowerCase(): {
        if (!hasAccess(commands.delete.isModeratorOnly) || !commandArg) return
        const targetUsername = parseCommandTarget(commandArg).toLowerCase()
        if (!targetUsername) return

        removePlayerFromAllQueues({
          userId: targetUsername,
          username: targetUsername,
          source,
          actorUsername: displayedUsername,
          rawCommand: trimmedText,
        })
        break
      }

      case commands.clear.name.toLowerCase(): {
        if (!hasAccess(commands.clear.isModeratorOnly)) return
        clearWaitingQueue({ source, actorUsername: displayedUsername })
        clearActiveQueue({ source, actorUsername: displayedUsername })

        sendMessage(formatPrefixedMessage(
          QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ALL,
          settings.messagePrefix,
        ))
        break
      }

      case commands.start.name.toLowerCase(): {
        if (!hasAccess(commands.start.isModeratorOnly)) return
        openQueue({ source, actorUsername: displayedUsername })
        break
      }

      case commands.stop.name.toLowerCase(): {
        if (!hasAccess(commands.stop.isModeratorOnly)) return
        closeQueue({ source, actorUsername: displayedUsername })
        break
      }

      case commands.play.name.toLowerCase(): {
        if (!hasAccess(commands.play.isModeratorOnly)) return
        finishActiveQueue({ source, actorUsername: displayedUsername })
        break
      }

      default:
        break
    }

    // Настройки намеренно не в зависимостях: их изменение не должно повторять последнюю команду.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])
}
