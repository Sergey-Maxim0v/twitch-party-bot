import {
  AUTH_STATE_VALIDATION_RESULTS,
  TWITCH_AUTH_STATE_STORAGE_KEY,
} from '../../../constants/auth.constants.ts'
import type { AuthStateValidationResult } from '../types'
import { readWebStorage, removeWebStorage, writeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

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
 * Сохраняет `state` в sessionStorage перед редиректом на Twitch.
 *
 * @param state - Сгенерированное значение `state`.
 * @returns `true`, если состояние удалось сохранить.
 */
export const saveAuthState = (state: string): boolean => (
  writeWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY, state)
)

/**
 * Сверяет вернувшийся `state` с сохранённым и удаляет его из sessionStorage.
 *
 * @param receivedState - Значение `state` из URL после редиректа.
 * @returns Результат проверки: валиден, не совпал или хранилище недоступно.
 */
export const consumeAuthState = (receivedState: string | null): AuthStateValidationResult => {
  const { value: savedState, isAvailable } = readWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY)

  if (!isAvailable) return AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE

  removeWebStorage('sessionStorage', TWITCH_AUTH_STATE_STORAGE_KEY)

  return savedState && savedState === receivedState
    ? AUTH_STATE_VALIDATION_RESULTS.VALID
    : AUTH_STATE_VALIDATION_RESULTS.INVALID
}
