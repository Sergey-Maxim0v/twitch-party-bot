const TWITCH_AUTH_STATE_STORAGE_KEY = 'twitch_oauth_state'

/**
 * Генерирует случайную безопасную строку для параметра state.
 */
export const generateRandomState = (): string => {
  const array = new Uint32Array(4)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('')
}

/**
 * Записывает state в сессию браузера.
 */
export const saveAuthState = (state: string): void => {
  sessionStorage.setItem(TWITCH_AUTH_STATE_STORAGE_KEY, state)
}

/**
 * Проверяет валидность вернувшегося параметра state и очищает сессию.
 */
export const isValidState = (receivedState: string | null): boolean => {
  const savedState = sessionStorage.getItem(TWITCH_AUTH_STATE_STORAGE_KEY)
  sessionStorage.removeItem(TWITCH_AUTH_STATE_STORAGE_KEY)

  return !(!savedState || !receivedState || savedState !== receivedState)
}
