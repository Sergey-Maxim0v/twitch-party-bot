import { useEffect } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_SOURCES, APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_PLAYER_SOURCE, type QueueActionLog } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { QUEUE_CHAT_COMMAND_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { TWITCH_CHAT_COMMAND_SPLIT_REGEX, TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'
import { parseCommandTarget } from '../utils/parseCommandTarget.ts'

/**
 * Обрабатывает команды чата Twitch: запись, статус, очистку и управление очередями.
 * Каждая попытка команды оставляет запись в журнале приложения.
 */
export const useChatCommands = () => {
  const { settings } = useQueueSettings()
  const { lastMessage } = useTwitchChat()
  const { pushLog } = useAppLogs()
  const { sendCurrentQueueStatus, sendClearAll } = useQueueNotification()
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
    const userId = lastMessage.user.userId ?? ''
    const username = lastMessage.user.nick
    const displayedUsername = lastMessage.user.displayName ?? lastMessage.user.nick
    const isSubscriber = lastMessage.user.isSubscriber
    const isVip = lastMessage.user.isVip
    const source = isModeratorOrStreamer ? APP_LOG_SOURCES.CHAT_MODERATOR : APP_LOG_SOURCES.CHAT_USER

    const logResult = (result: QueueActionLog): void => {
      pushLog({
        message: result.message,
        status: result.logStatus,
        source,
        actorUsername: displayedUsername,
        rawCommand: trimmedText,
      })
    }

    const logRefusal = (message: string): void => {
      logResult({ message, logStatus: APP_LOG_STATUSES.ERROR })
    }

    const hasCommandAccess = (command: { name: string; isModeratorOnly: boolean }): boolean => {
      if (!command.isModeratorOnly || isModeratorOrStreamer) return true

      logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.ACCESS_DENIED(command.name))
      return false
    }

    switch (commandName) {
      case commands.join.name.toLowerCase(): {
        if (!hasCommandAccess(commands.join)) return

        logResult(addPlayerToQueue({
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
          silentLog: true,
        }))
        return
      }

      case commands.leave.name.toLowerCase(): {
        if (!hasCommandAccess(commands.leave)) return

        logResult(removePlayerFromAllQueues({
          userId,
          username,
          source,
          actorUsername: displayedUsername,
          silentLog: true,
        }))
        return
      }

      case commands.show.name.toLowerCase(): {
        if (!hasCommandAccess(commands.show)) return

        sendCurrentQueueStatus()
        logResult({
          message: QUEUE_CHAT_COMMAND_LOG_MESSAGES.STATUS_SHOWN,
          logStatus: APP_LOG_STATUSES.INFO,
        })
        return
      }

      case commands.add.name.toLowerCase(): {
        if (!hasCommandAccess(commands.add)) return

        if (!commandArg) {
          logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.MISSING_TARGET(commands.add.name))
          return
        }

        const targetUsername = parseCommandTarget(commandArg)
        if (!TWITCH_LOGIN_PATTERN.test(targetUsername.toLowerCase())) {
          logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.INVALID_TARGET(commands.add.name))
          return
        }

        logResult(addPlayerToQueue({
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
          silentLog: true,
        }))
        return
      }

      case commands.delete.name.toLowerCase(): {
        if (!hasCommandAccess(commands.delete)) return

        if (!commandArg) {
          logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.MISSING_TARGET(commands.delete.name))
          return
        }

        const targetUsername = parseCommandTarget(commandArg).toLowerCase()
        if (!targetUsername) {
          logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.INVALID_TARGET(commands.delete.name))
          return
        }

        logResult(removePlayerFromAllQueues({
          userId: targetUsername,
          username: targetUsername,
          source,
          actorUsername: displayedUsername,
          silentLog: true,
        }))
        return
      }

      case commands.clear.name.toLowerCase(): {
        if (!hasCommandAccess(commands.clear)) return

        clearActiveQueue({ source, actorUsername: displayedUsername, silentLog: true, notify: false })
        clearWaitingQueue({ source, actorUsername: displayedUsername, silentLog: true, notify: false })
        logResult({
          message: QUEUE_CHAT_COMMAND_LOG_MESSAGES.CLEARED_ALL,
          logStatus: APP_LOG_STATUSES.WARNING,
        })

        sendClearAll()
        return
      }

      case commands.start.name.toLowerCase(): {
        if (!hasCommandAccess(commands.start)) return

        logResult(openQueue({ source, actorUsername: displayedUsername, silentLog: true }))
        return
      }

      case commands.stop.name.toLowerCase(): {
        if (!hasCommandAccess(commands.stop)) return

        logResult(closeQueue({ source, actorUsername: displayedUsername, silentLog: true }))
        return
      }

      case commands.play.name.toLowerCase(): {
        if (!hasCommandAccess(commands.play)) return

        logResult(finishActiveQueue({ source, actorUsername: displayedUsername, silentLog: true }))
        return
      }

      default:
        return
    }

    // Зависимости ограничены последним сообщением: изменение настроек не должно повторять команду.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage])
}
