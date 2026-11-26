import type { QueueSettings } from '../../queue-settings/types.ts'
import {
  QUEUE_CHAT_NOTIFICATION_MESSAGES,
  QUEUE_COMMAND_CHAT_DESCRIPTIONS,
  QUEUE_COMMAND_LIST_TITLE,
  QUEUE_LIST_SEPARATOR,
} from '../../../constants/queue.constants.ts'
import { fitChatMessage } from '../../../services/twitch/utils/fitChatMessage.ts'
import { formatHiddenMembersCount } from './formatHiddenMembersCount.ts'
import { formatPrefixedMessage } from './formatPrefixedMessage.ts'

interface FormatQueueOpenMessageArgs {
  /** Настройки команд чата. */
  commands: QueueSettings['commands'];
  /** Префикс автоматических сообщений. */
  prefix: QueueSettings['messagePrefix'];
}

/**
 * Формирует сообщение об открытии очереди со списком доступных команд.
 */
export const formatQueueOpenMessage = ({
  commands,
  prefix,
}: FormatQueueOpenMessageArgs): string => {
  const availableCommands = [
    { command: commands.join, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.JOIN },
    { command: commands.leave, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.LEAVE },
    { command: commands.show, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.SHOW },
    { command: commands.start, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.START },
    { command: commands.stop, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.STOP },
    { command: commands.play, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.PLAY },
    { command: commands.clear, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.CLEAR },
    { command: commands.add, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.ADD },
    { command: commands.delete, description: QUEUE_COMMAND_CHAT_DESCRIPTIONS.DELETE },
  ]
    .filter(({ command }) => !command.isModeratorOnly)
    .map(({ command, description }) => `${command.name} ${description}`)

  const baseMessage = formatPrefixedMessage(QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_OPENED, prefix)

  if (availableCommands.length === 0) return baseMessage

  const head = `${baseMessage} ${QUEUE_COMMAND_LIST_TITLE}`

  return fitChatMessage({
    build: ([visible]) => {
      if (visible === 0) return `${head}${formatHiddenMembersCount(availableCommands.length)}.`

      const hidden = availableCommands.length - visible

      return `${head} ${availableCommands.slice(0, visible).join(QUEUE_LIST_SEPARATOR)}${formatHiddenMembersCount(hidden)}.`
    },
    counts: [availableCommands.length],
    minVisible: [0],
  })
}
