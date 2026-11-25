import { TWITCH_CHAT_COMMAND_SPLIT_REGEX } from '../../../constants/twitch.constants.ts'

/**
 * Возвращает триггер команды — первое слово в нижнем регистре.
 *
 * @param value - Имя команды или префикс сообщений.
 * @returns Триггер или пустая строка.
 */
export const getCommandTrigger = (value: string): string =>
  value.trim().split(TWITCH_CHAT_COMMAND_SPLIT_REGEX)[0]?.toLowerCase() ?? ''
