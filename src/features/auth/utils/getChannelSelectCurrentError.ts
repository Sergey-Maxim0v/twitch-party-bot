import { TWITCH_CHANNEL_ERRORS, TWITCH_CHANNEL_PROFILE_STATUSES } from '../../../constants/auth.constants.ts'
import type { TwitchChannelProfileFailure } from './getTwitchChannelProfile.ts'
import { validateChannelName } from './validateChannelName.ts'

interface GetChannelErrorParams {
  channelError: string | null;
  isValidationTriggered: boolean;
  value: string;
  profileFailure: TwitchChannelProfileFailure | null;
}

/**
 * Подбирает текст ошибки под полем ввода канала.
 * Приоритет: ошибка канала, неудачная проверка, локальная валидация.
 * Пустое значение ошибкой не считается: кнопка подключения в этом случае неактивна.
 *
 * @param params - Текущее состояние формы выбора канала.
 * @returns Текст ошибки или `null`.
 */
export const getChannelSelectCurrentError = ({
  channelError,
  isValidationTriggered,
  value,
  profileFailure,
}: GetChannelErrorParams): string | null => {
  if (channelError) return channelError
  if (profileFailure === TWITCH_CHANNEL_PROFILE_STATUSES.NOT_FOUND) return TWITCH_CHANNEL_ERRORS.NOT_FOUND
  if (profileFailure === TWITCH_CHANNEL_PROFILE_STATUSES.UNAVAILABLE) return TWITCH_CHANNEL_ERRORS.UNAVAILABLE
  if (!isValidationTriggered) return null

  const trimmed = value.trim()

  if (trimmed && !validateChannelName(trimmed)) return TWITCH_CHANNEL_ERRORS.INVALID

  return null
}
