import { TWITCH_CHAT_COMMAND_SPLIT_REGEX } from '../../../constants/twitch.constants.ts'

/**
 * Находит команду, совпадающую с первым словом префикса автоматических сообщений.
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
  const prefixToken = prefix?.trim().split(TWITCH_CHAT_COMMAND_SPLIT_REGEX)[0]?.toLowerCase() ?? ''

  if (!prefixToken) return null

  return commandNames.find(name => name.toLowerCase() === prefixToken) ?? null
}
