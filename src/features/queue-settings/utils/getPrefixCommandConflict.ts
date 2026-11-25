import { getCommandTrigger } from './getCommandTrigger.ts'

/**
 * Находит команду, первое слово которой совпадает с первым словом префикса.
 * Сравнение не учитывает регистр и пробелы.
 *
 * @param prefix - Префикс автоматических сообщений.
 * @param commandNames - Имена команд чата.
 * @returns Имя конфликтующей команды или `null`, если конфликта нет.
 */
export const getPrefixCommandConflict = (
  prefix: string | undefined,
  commandNames: readonly string[],
): string | null => {
  const prefixTrigger = getCommandTrigger(prefix ?? '')

  if (!prefixTrigger) return null

  return commandNames.find(name => getCommandTrigger(name) === prefixTrigger) ?? null
}
