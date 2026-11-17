import { AUTH_STATE_VALIDATION_RESULTS } from '../../../constants/auth.constants.ts'
import type { AuthAttemptCheckResult } from '../types'
import { clearAuthAttempt } from './clearAuthAttempt.ts'
import { readAuthAttempt } from './readAuthAttempt.ts'

/**
 * Сверяет вернувшийся `state` с сохранённой попыткой входа и удаляет её.
 *
 * Запись удаляется при любом исходе, если хранилище доступно: висящая попытка
 * не должна засчитываться следующему запросу.
 *
 * @param receivedState - Значение `state` из ответа Twitch.
 * @returns Результат проверки и сохранённая попытка (если была).
 */
export const consumeAuthAttempt = (receivedState: string | null): AuthAttemptCheckResult => {
  const { result, attempt } = readAuthAttempt()

  if (result === AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE) return { result, attempt }

  clearAuthAttempt()

  if (result !== AUTH_STATE_VALIDATION_RESULTS.VALID || !attempt) return { result, attempt }

  return {
    result: attempt.state === receivedState
      ? AUTH_STATE_VALIDATION_RESULTS.VALID
      : AUTH_STATE_VALIDATION_RESULTS.INVALID,
    attempt,
  }
}
