import { TWITCH_CHAT_MENTION_REGEX } from '../../../constants/twitch.constants.ts'

/**
 * Отбрасывает упоминание и пробелы вокруг аргумента команды чата.
 *
 * @param argument - Аргумент команды.
 * @returns Очищенное значение аргумента.
 */
export const parseCommandTarget = (argument: string): string => argument.trim().replace(TWITCH_CHAT_MENTION_REGEX, '').trim()
