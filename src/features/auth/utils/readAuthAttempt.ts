import {
  AUTH_STATE_VALIDATION_RESULTS,
  TWITCH_AUTH_STATE_STORAGE_KEY,
  TWITCH_AUTH_STATE_STORAGE_KIND,
  TWITCH_AUTH_STATE_TTL_MS,
} from '../../../constants/auth.constants.ts'
import type { AuthAttemptCheckResult } from '../types'
import { readWebStorage } from '../../../hooks/utils/webStorage.utils.ts'
import { parseAuthAttempt } from './parseAuthAttempt.ts'

/**
 * Читает сохранённую попытку входа, не изменяя хранилище.
 *
 * Проверяется только сама запись: её наличие, целостность и срок жизни.
 * Совпадение `state` с ответом Twitch сверяют вызывающие функции.
 *
 * @returns Состояние записи и восстановленная попытка входа.
 */
export const readAuthAttempt = (): AuthAttemptCheckResult => {
  const { value, isAvailable } = readWebStorage(TWITCH_AUTH_STATE_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)

  if (!isAvailable) return { result: AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE, attempt: null }

  const attempt = parseAuthAttempt(value)

  if (!attempt) return { result: AUTH_STATE_VALIDATION_RESULTS.INVALID, attempt: null }

  if (Date.now() - attempt.createdAt > TWITCH_AUTH_STATE_TTL_MS) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.EXPIRED, attempt }
  }

  return { result: AUTH_STATE_VALIDATION_RESULTS.VALID, attempt }
}
