import { validateChannelName } from './validateChannelName.ts'

interface GetChannelErrorParams {
  channelError: string | null;
  isValidationTriggered: boolean;
  value: string;
  isNotFound: boolean
}

/**
 * Определяет текст ошибки, который нужно показать под полем ввода канала.
 * Приоритет: ошибка из стора, затем «канал не найден», затем локальная валидация.
 *
 * @param params - Текущее состояние формы выбора канала.
 * @returns Текст ошибки или `null`, если ошибок нет.
 */
export const getChannelSelectCurrentError = ({
  channelError,
  isValidationTriggered,
  value,
  isNotFound,
}: GetChannelErrorParams): string | null => {
  if (channelError) return channelError
  if (isNotFound) return 'Канал не найден на Twitch.'
  if (!isValidationTriggered) return null

  const trimmed = value.trim()

  if (!trimmed) return 'Имя канала не может быть пустым.'
  if (!validateChannelName(trimmed)) return 'Некорректное имя канала Twitch.'

  return null
}
