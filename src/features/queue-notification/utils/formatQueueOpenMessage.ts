import type { QueueSettings } from '../../queue-settings/types.ts'

/**
 * Сформировать текстовое сообщение об открытии очереди на основе доступных для пользователей команд
 */
export const formatQueueOpenMessage = (commands: QueueSettings['commands']): string => {
  const parts: string[] = []

  if (!commands.join.isModeratorOnly) {
    parts.push(`${commands.join.name} для входа`)
  }
  if (!commands.leave.isModeratorOnly) {
    parts.push(`${commands.leave.name} для удаления себя`)
  }
  if (!commands.show.isModeratorOnly) {
    parts.push(`${commands.show.name} для просмотра очереди`)
  }
  if (!commands.start.isModeratorOnly) {
    parts.push(`${commands.start.name} для открытия`)
  }
  if (!commands.stop.isModeratorOnly) {
    parts.push(`${commands.stop.name} для закрытия`)
  }
  if (!commands.play.isModeratorOnly) {
    parts.push(`${commands.play.name} для завершения`)
  }
  if (!commands.clear.isModeratorOnly) {
    parts.push(`${commands.clear.name} для очистки`)
  }
  if (!commands.add.isModeratorOnly) {
    parts.push(`${commands.add.name} для добавления`)
  }
  if (!commands.delete.isModeratorOnly) {
    parts.push(`${commands.delete.name} для исключения`)
  }

  const prefix = 'Очередь открыта!'

  return parts.length > 0
    ? `${prefix} Доступные команды: ${parts.join(', ')}.`
    : prefix
}
