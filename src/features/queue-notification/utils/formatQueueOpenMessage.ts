import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_CHAT_NOTIFICATION_MESSAGES } from '../../../constants/queue.constants.ts'

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
    { command: commands.join, description: 'для входа' },
    { command: commands.leave, description: 'для выхода' },
    { command: commands.show, description: 'для просмотра очереди' },
    { command: commands.start, description: 'для открытия' },
    { command: commands.stop, description: 'для закрытия' },
    { command: commands.play, description: 'для завершения' },
    { command: commands.clear, description: 'для очистки' },
    { command: commands.add, description: 'для добавления' },
    { command: commands.delete, description: 'для исключения' },
  ]
    .filter(({ command }) => !command.isModeratorOnly)
    .map(({ command, description }) => `${command.name} ${description}`)

  const baseMessage = prefix
    ? `${prefix} ${QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_OPENED}`
    : QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_OPENED

  if (availableCommands.length === 0) {
    return baseMessage
  }

  return `${baseMessage} Доступные команды: ${availableCommands.join(', ')}.`
}
