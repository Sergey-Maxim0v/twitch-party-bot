import { TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'

/**
 * Проверяет имя канала Twitch на соответствие правилам платформы.
 * Twitch разрешает от 4 до 25 символов, но есть старые и специальные аккаунты от 2 символов.
 *
 * @param name - Проверяемое имя канала.
 * @returns `true`, если имя корректно.
 */
export const validateChannelName = (name: string): boolean =>
  TWITCH_LOGIN_PATTERN.test(name.trim().toLowerCase())
