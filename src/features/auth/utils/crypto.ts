import {
  AUTH_STATE_VALIDATION_RESULTS,
  TWITCH_AUTH_STATE_STORAGE_KEY,
} from '../../../constants/auth.constants.ts'
import type { AuthStateValidationResult } from '../types'
import { readWebStorage, removeWebStorage, writeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Данные попытки входа, сохраняемые в sessionStorage перед редиректом на Twitch.
 */
export interface AuthAttempt {
  state: string;
  contextType: 'popup' | 'tab';
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
 * Сохраняет попытку входа (`state` + тип контекста) в sessionStorage перед редиректом на Twitch.
 * Единый источник правды для последующей проверки `state`.
 *
 * @param state - Сгенерированное значение `state`.
 * @param contextType - Тип контекста входа: `popup` или `tab`.
 * @returns `true`, если состояние удалось сохранить.
 */
export const saveAuthAttempt = (state: string, contextType: 'popup' | 'tab'): boolean => (
  writeWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY, JSON.stringify({ state, contextType }))
)

/**
 * Сверяет вернувшийся `state` с сохранённой попыткой входа и удаляет её из sessionStorage.
 * Проверка выполняется только в документе, вернувшемся с редиректа Twitch.
 *
 * @param receivedState - Значение `state` из URL после редиректа.
 * @returns Результат проверки и сохранённая попытка (если была).
 */
export const consumeAuthAttempt = (receivedState: string | null): AuthConsumeResult => {
  const { value, isAvailable } = readWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY)

  if (!isAvailable) {
    return { result: AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE, attempt: null }
  }

  removeWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY)

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
