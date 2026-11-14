import { TWITCH_IRC_LINE_BREAK_REPLACEMENT, TWITCH_IRC_LINE_BREAKS_REGEX } from '../../../constants/twitch.constants.ts'

/**
 * Заменяет переводы строк пробелами, чтобы текст остался одной IRC-командой.
 *
 * @param text - Текст сообщения.
 * @returns Текст без переводов строк.
 */
export const flattenIrcMessageText = (text: string): string =>
  text.replace(TWITCH_IRC_LINE_BREAKS_REGEX, TWITCH_IRC_LINE_BREAK_REPLACEMENT)
