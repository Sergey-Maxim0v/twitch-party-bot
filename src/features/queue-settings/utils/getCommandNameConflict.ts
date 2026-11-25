import type { QueueSettings } from '../types.ts'
import { getCommandTrigger } from './getCommandTrigger.ts'

/**
 * Находит ключ команды с уже занятым триггером.
 *
 * @param name - Проверяемое имя команды.
 * @param commands - Настройки команд чата.
 * @param excludedKey - Редактируемая команда, исключаемая из поиска.
 * @returns Ключ конфликтующей команды или `null`.
 */
export const getCommandNameConflict = (
  name: string,
  commands: QueueSettings['commands'],
  excludedKey?: keyof QueueSettings['commands'],
): keyof QueueSettings['commands'] | null => {
  const trigger = getCommandTrigger(name)
  if (!trigger) return null

  const conflictingKey = (
    Object.keys(commands) as Array<keyof QueueSettings['commands']>
  ).find(key => key !== excludedKey && getCommandTrigger(commands[key].name) === trigger)

  return conflictingKey ?? null
}
