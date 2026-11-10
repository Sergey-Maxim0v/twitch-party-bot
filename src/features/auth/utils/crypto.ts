import { TWITCH_AUTH_STATE_STORAGE_KEY } from '../../../constants/auth.constants.ts'

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
 */
export const saveAuthState = (state: string): void => {
  sessionStorage.setItem(TWITCH_AUTH_STATE_STORAGE_KEY, state)
}

/**
 * Сверяет вернувшийся `state` с сохранённым и удаляет его из sessionStorage.
 * Значение удаляется всегда, поэтому повторная проверка невозможна.
 *
 * @param receivedState - Значение `state` из URL после редиректа.
 * @returns `true`, если `state` совпадает с сохранённым.
 */
export const isValidState = (receivedState: string | null): boolean => {
  const savedState = sessionStorage.getItem(TWITCH_AUTH_STATE_STORAGE_KEY)
  sessionStorage.removeItem(TWITCH_AUTH_STATE_STORAGE_KEY)

  return Boolean(savedState) && savedState === receivedState
}
