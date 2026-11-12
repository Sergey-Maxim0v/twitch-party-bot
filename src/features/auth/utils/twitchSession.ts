import type { TwitchUserData, TwitchUserSession } from '../types'
import { isFilledString } from '../../../utils/strings.ts'

/**
 * Проверяет, что значение похоже на запись сессии.
 *
 * @param session - Значение из хранилища.
 * @returns `true`, если значение является объектом с полями.
 */
const isSessionObject = (session: unknown): session is Record<string, unknown> => (
  typeof session === 'object' && session !== null && !Array.isArray(session)
)

/**
 * Собирает сессию пользователя из токена и данных Twitch.
 *
 * @param token - Токен доступа OAuth.
 * @param user - Данные пользователя, полученные от Twitch.
 * @returns Сессия для сохранения в хранилище.
 */
export const buildTwitchSession = (token: string, user: TwitchUserData): TwitchUserSession => ({
  accessToken: token,
  userId: user.userId,
  login: user.login,
})

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
  if (!isSessionObject(session)) return false

  const { accessToken, userId, login } = session

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
  if (!isSessionObject(session)) return null

  const { accessToken } = session

  return isFilledString(accessToken) ? accessToken : null
}
