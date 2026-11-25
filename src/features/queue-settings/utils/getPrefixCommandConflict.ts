import { TWITCH_CHAT_COMMAND_SPLIT_REGEX } from '../../../constants/twitch.constants.ts'

const getTrigger = (value: string): string =>
  value.trim().split(TWITCH_CHAT_COMMAND_SPLIT_REGEX)[0]?.toLowerCase() ?? ''

/**
 * Находит команду, первое слово которой совпадает с первым словом префикса.
 * Сравнение не учитывает регистр.
 *
 * @param prefix - Префикс автоматических сообщений.
 * @param commandNames - Имена команд чата.
 * @returns Имя конфликтующей команды или `null`, если конфликта нет.
 */
export const getPrefixCommandConflict = (
  prefix: string | undefined,
  commandNames: readonly string[],
): string | null => {
  const prefixTrigger = getTrigger(prefix ?? '')

  if (!prefixTrigger) return null

  return commandNames.find(name => getTrigger(name) === prefixTrigger) ?? null
}
