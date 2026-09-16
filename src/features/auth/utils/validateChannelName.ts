/**
 * Проверяет имя канала Twitch на соответствие официальным правилам платформы.
 * Допускаются только буквы, цифры и подчеркивания, длина от 2 до 25 символов.
 * Twitch разрешает от 4 до 25 символов, но есть старые и специальные аккаунты от 2 символов.
 */
export const validateChannelName = (name: string): boolean => {
  const trimmed = name.trim().toLowerCase()
  const twitchUserRegex = /^[a-z0-9_]{2,25}$/
  return twitchUserRegex.test(trimmed)
}
