import { TWITCH_LOGIN_PATTERN } from '../../../constants/twitch.constants.ts'
import { hasControlCharacters, isFilledString } from '../../../utils/strings.ts'

interface IrcCredentials {
  channel: unknown;
  token: unknown;
  userLogin: unknown;
}

/**
 * Проверяет логин Twitch: канал и имя пользователя подчиняются одним правилам.
 */
const isLoginValid = (value: unknown): boolean =>
  isFilledString(value) && TWITCH_LOGIN_PATTERN.test(value.toLowerCase())

/**
 * Проверяет, что параметры сессии безопасно подставлять в IRC-команды.
 *
 * @param credentials - Канал, токен и логин пользователя.
 * @returns `true`, если значения соответствуют правилам Twitch и не содержат управляющих символов.
 */
export const isIrcCredentialsValid = ({ channel, token, userLogin }: IrcCredentials): boolean =>
  isLoginValid(channel)
  && isLoginValid(userLogin)
  && isFilledString(token)
  && !hasControlCharacters(token)
