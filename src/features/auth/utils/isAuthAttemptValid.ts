import { AUTH_STATE_VALIDATION_RESULTS } from '../../../constants/auth.constants.ts'
import { readAuthAttempt } from './readAuthAttempt.ts'

/**
 * Проверяет `state` из сообщения popup по сохранённой попытке входа.
 *
 * Запись не удаляется: сообщение в общий канал может отправить посторонний
 * скрипт того же источника, а настоящий ответ Twitch должен быть принят следом.
 *
 * @param receivedState - Значение `state` из сообщения.
 * @returns `true`, если попытка есть, не истекла и её `state` совпадает.
 */
export const isAuthAttemptValid = (receivedState: string | null): boolean => {
  const { result, attempt } = readAuthAttempt()

  return result === AUTH_STATE_VALIDATION_RESULTS.VALID && attempt?.state === receivedState
}
