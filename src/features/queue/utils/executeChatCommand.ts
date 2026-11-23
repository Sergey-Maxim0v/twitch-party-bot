import type { ParsedIrcMessage } from '../../../services/twitch/types.ts'
import { APP_LOG_SOURCES, APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueNotificationContextType } from '../../queue-notification/context/QueueNotificationInstance.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_CHAT_COMMAND_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { TWITCH_CHAT_COMMAND_SPLIT_REGEX, TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { QUEUE_PLAYER_SOURCE, type QueueActionLog } from '../types.ts'
import { parseCommandTarget } from './parseCommandTarget.ts'

type QueueChatActions = Pick<
  QueueContextValue,
  | 'openQueue'
  | 'closeQueue'
  | 'addPlayerToQueue'
  | 'removePlayerFromAllQueues'
  | 'clearActiveQueue'
  | 'clearWaitingQueue'
  | 'finishActiveQueue'
>

type ChatNotificationActions = Pick<QueueNotificationContextType, 'sendCurrentQueueStatus' | 'sendClearAll'>

type ChatLogger = Pick<AppLogsContextValue, 'pushLog'>

interface ExecuteChatCommandArgs extends QueueChatActions, ChatNotificationActions, ChatLogger {
  message: ParsedIrcMessage;
  settings: QueueSettings;
}

interface CommandContext extends ExecuteChatCommandArgs {
  trimmedText: string;
  rawCommandName: string;
  commandArgs: string[];
  commandArg: string;
  isModeratorOrStreamer: boolean;
  userId: string;
  username: string;
  displayedUsername: string;
  source: LogSource;
}

type CommandConfig = QueueSettings['commands'][keyof QueueSettings['commands']]

const createCommandHelpers = (context: CommandContext) => {
  const logResult = (result: QueueActionLog): void => {
    context.pushLog({
      message: result.message,
      status: result.logStatus,
      source: context.source,
      actorUsername: context.displayedUsername,
      rawCommand: context.trimmedText,
    })
  }

  const logRefusal = (message: string): void => {
    logResult({ message, logStatus: APP_LOG_STATUSES.ERROR })
  }

  const hasAccess = (command: CommandConfig): boolean => {
    if (!command.isModeratorOnly || context.isModeratorOrStreamer) return true

    logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.ACCESS_DENIED(command.name))
    return false
  }

  return { logResult, logRefusal, hasAccess }
}

type CommandHelpers = ReturnType<typeof createCommandHelpers>

type CommandHandler = (context: CommandContext, helpers: CommandHelpers) => void

const handleJoin: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, message, userId, username, displayedUsername, source, isModeratorOrStreamer, trimmedText } = context
  if (!hasAccess(settings.commands.join)) return

  logResult(context.addPlayerToQueue({
    playerData: {
      userId,
      username,
      displayedUsername,
      rawMessage: trimmedText,
      playerSource: QUEUE_PLAYER_SOURCE.USER_CMD,
      isModerator: isModeratorOrStreamer,
      isSubscriber: message.user.isSubscriber,
      isVip: message.user.isVip,
    },
    source,
    actorUsername: displayedUsername,
    silentLog: true,
  }))
}

const handleLeave: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, userId, username, displayedUsername, source } = context
  if (!hasAccess(settings.commands.leave)) return

  logResult(context.removePlayerFromAllQueues({
    userId,
    username,
    source,
    actorUsername: displayedUsername,
    silentLog: true,
  }))
}

const handleShow: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings } = context
  if (!hasAccess(settings.commands.show)) return

  context.sendCurrentQueueStatus()
  logResult({
    message: QUEUE_CHAT_COMMAND_LOG_MESSAGES.STATUS_SHOWN,
    logStatus: APP_LOG_STATUSES.INFO,
  })
}

const handleAdd: CommandHandler = (context, { logResult, logRefusal, hasAccess }) => {
  const { settings, commandArgs, commandArg, rawCommandName, source, displayedUsername } = context
  if (!hasAccess(settings.commands.add)) return

  if (!commandArg) {
    logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.MISSING_TARGET(settings.commands.add.name))
    return
  }

  const targetIndex = commandArgs.findIndex(arg => TWITCH_LOGIN_PATTERN.test(parseCommandTarget(arg).toLowerCase()))
  if (targetIndex < 0) {
    logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.INVALID_TARGET(settings.commands.add.name))
    return
  }

  const targetUsername = parseCommandTarget(commandArgs[targetIndex])

  const remainingText = [
    rawCommandName,
    ...commandArgs.filter((_, index) => index !== targetIndex),
  ].join(' ')

  logResult(context.addPlayerToQueue({
    playerData: {
      userId: targetUsername,
      username: targetUsername.toLowerCase(),
      displayedUsername: targetUsername,
      rawMessage: remainingText,
      playerSource: QUEUE_PLAYER_SOURCE.MOD_CMD,
      isModerator: false,
      isSubscriber: false,
      isVip: false,
    },
    source,
    actorUsername: displayedUsername,
    silentLog: true,
  }))
}

const handleDelete: CommandHandler = (context, { logResult, logRefusal, hasAccess }) => {
  const { settings, commandArgs, commandArg, source, displayedUsername } = context
  if (!hasAccess(settings.commands.delete)) return

  if (!commandArg) {
    logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.MISSING_TARGET(settings.commands.delete.name))
    return
  }

  const targetCandidate = commandArgs
    .map(arg => parseCommandTarget(arg).toLowerCase())
    .find(candidate => Boolean(candidate) && TWITCH_LOGIN_PATTERN.test(candidate))

  if (!targetCandidate) {
    logRefusal(QUEUE_CHAT_COMMAND_LOG_MESSAGES.INVALID_TARGET(settings.commands.delete.name))
    return
  }

  logResult(context.removePlayerFromAllQueues({
    userId: targetCandidate,
    username: targetCandidate,
    source,
    actorUsername: displayedUsername,
    silentLog: true,
  }))
}

const handleClear: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, source, displayedUsername } = context
  if (!hasAccess(settings.commands.clear)) return

  context.clearActiveQueue({ source, actorUsername: displayedUsername, silentLog: true, notify: false })
  context.clearWaitingQueue({ source, actorUsername: displayedUsername, silentLog: true, notify: false })
  logResult({
    message: QUEUE_CHAT_COMMAND_LOG_MESSAGES.CLEARED_ALL,
    logStatus: APP_LOG_STATUSES.WARNING,
  })
  context.sendClearAll()
}

const handleStart: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, source, displayedUsername } = context
  if (!hasAccess(settings.commands.start)) return

  logResult(context.openQueue({ source, actorUsername: displayedUsername, silentLog: true }))
}

const handleStop: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, source, displayedUsername } = context
  if (!hasAccess(settings.commands.stop)) return

  logResult(context.closeQueue({ source, actorUsername: displayedUsername, silentLog: true }))
}

const handlePlay: CommandHandler = (context, { logResult, hasAccess }) => {
  const { settings, source, displayedUsername } = context
  if (!hasAccess(settings.commands.play)) return

  logResult(context.finishActiveQueue({ source, actorUsername: displayedUsername, silentLog: true }))
}

const getCommandHandlers = (settings: QueueSettings): Array<[string, CommandHandler]> => [
  [settings.commands.join.name.toLowerCase(), handleJoin],
  [settings.commands.leave.name.toLowerCase(), handleLeave],
  [settings.commands.show.name.toLowerCase(), handleShow],
  [settings.commands.add.name.toLowerCase(), handleAdd],
  [settings.commands.delete.name.toLowerCase(), handleDelete],
  [settings.commands.clear.name.toLowerCase(), handleClear],
  [settings.commands.start.name.toLowerCase(), handleStart],
  [settings.commands.stop.name.toLowerCase(), handleStop],
  [settings.commands.play.name.toLowerCase(), handlePlay],
]

/** Выполняет команду из сообщения чата. */
export const executeChatCommand = (args: ExecuteChatCommandArgs): void => {
  const { message, settings } = args
  if (!message.text || message.isAutomated) return

  const trimmedText = message.text.trim()
  const [rawCommandName = '', ...commandArgs] = trimmedText.split(TWITCH_CHAT_COMMAND_SPLIT_REGEX)
  const commandName = rawCommandName.toLowerCase()
  if (!commandName) return

  const isModeratorOrStreamer = Boolean(message.user.isBroadcaster || message.user.isModerator)
  const context: CommandContext = {
    ...args,
    trimmedText,
    rawCommandName,
    commandArgs,
    commandArg: commandArgs.join(' '),
    isModeratorOrStreamer,
    userId: message.user.userId ?? '',
    username: message.user.nick,
    displayedUsername: message.user.displayName ?? message.user.nick,
    source: isModeratorOrStreamer ? APP_LOG_SOURCES.CHAT_MODERATOR : APP_LOG_SOURCES.CHAT_USER,
  }

  const handler = getCommandHandlers(settings).find(([name]) => name === commandName)?.[1]
  if (!handler) return

  handler(context, createCommandHelpers(context))
}
