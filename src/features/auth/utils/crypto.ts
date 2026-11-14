import {
  AUTH_STATE_VALIDATION_RESULTS,
  TWITCH_AUTH_STATE_STORAGE_KEY,
} from '../../../constants/auth.constants.ts'
import type { AuthContextType, AuthStateValidationResult } from '../types'
import {
  readWebStorage,
  removeWebStorage,
  writeWebStorage,
  type WebStorageKind,
} from '../../../hooks/utils/webStorage.utils.ts'

const AUTH_STORAGE_KIND: WebStorageKind = 'sessionStorage'

/**
 * Данные попытки входа, сохраняемые в sessionStorage перед редиректом на Twitch.
 */
export interface AuthAttempt {
  state: string;
  contextType: AuthContextType;
}

/**
 * Результат проверки попытки входа.
 */
export interface AuthConsumeResult {
  result: AuthStateValidationResult;
  attempt: AuthAttempt | null;
}

/**
 * Генерирует случайную строку для параметра `state`, защищающего OAuth-поток от CSRF.
 *
 * @returns Случайная hex-строка длиной 32 символа.
 */
export const generateRandomState = (): string => {
  const array = new Uint32Array(4)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('')
}

/**
 * Сохраняет попытку входа (`state` + контекст) перед редиректом на Twitch.
 *
 * @param state - Сгенерированное значение `state`.
 * @param contextType - Контекст входа: `popup` или `tab`.
 * @returns `true`, если состояние удалось сохранить.
 */
export const saveAuthAttempt = (state: string, contextType: AuthContextType): boolean => (
  writeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY, JSON.stringify({ state, contextType }))
)

/**
 * Удаляет сохранённую попытку входа.
 */
export const clearAuthAttempt = (): void => {
  removeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)
}

/**
 * Сверяет вернувшийся `state` с сохранённой попыткой входа и удаляет её.
 *
 * @param receivedState - Значение `state` из URL после редиректа.
 * @returns Результат проверки и сохранённая попытка (если была).
 */
export const consumeAuthAttempt = (receivedState: string | null): AuthConsumeResult => {
  const { value, isAvailable } = readWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)

  if (!isAvailable) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE, attempt: null }
  }

  removeWebStorage(AUTH_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)

  let attempt: AuthAttempt | null = null

  if (value) {
    try {
      attempt = JSON.parse(value) as AuthAttempt
    } catch {
      attempt = null
    }
  }

  const isValid = Boolean(attempt && attempt.state === receivedState)

  return {
    result: isValid ? AUTH_STATE_VALIDATION_RESULTS.VALID : AUTH_STATE_VALIDATION_RESULTS.INVALID,
    attempt,
  }
}
