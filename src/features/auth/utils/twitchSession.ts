import type { TwitchUserSession } from '../types'
import { isFilledString } from '../../../utils/strings.ts'

/**
 * Проверяет, что значение из хранилища является полноценной сессией Twitch.
 *
 * Хранилище возвращает данные без проверки структуры, поэтому повреждённая
 * запись иначе выглядит как авторизация: UI показывает вход в аккаунт,
 * но сокет не подключается из-за пустого логина.
 *
 * @param session - Значение из хранилища.
 * @returns `true`, если все обязательные поля заполнены.
 */
export const isValidTwitchSession = (session: unknown): session is TwitchUserSession => {
  if (typeof session !== 'object' || session === null || Array.isArray(session)) {
    return false
  }

  const { accessToken, userId, login } = session as Record<string, unknown>

  return isFilledString(accessToken) && isFilledString(userId) && isFilledString(login)
}

/**
 * Извлекает токен доступа из произвольного значения сессии.
 *
 * Позволяет отличить сессию, которую можно восстановить повторной валидацией,
 * от мусора, который следует удалить.
 *
 * @param session - Значение из хранилища.
 * @returns Токен доступа либо `null`, если токена нет.
 */
export const getTwitchAccessToken = (session: unknown): string | null => {
  if (typeof session !== 'object' || session === null || Array.isArray(session)) {
    return null
  }

  const { accessToken } = session as Record<string, unknown>

  return isFilledString(accessToken) ? accessToken : null
}
