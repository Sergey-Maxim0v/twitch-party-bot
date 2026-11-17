/**
 * Генерирует случайную строку для параметра `state`, защищающего OAuth-поток от CSRF.
 *
 * @returns Случайная hex-строка длиной 32 символа.
 */
export const generateRandomState = (): string => {
  const array = new Uint32Array(4)
  window.crypto.getRandomValues(array)

  return Array.from(array, part => part.toString(16).padStart(8, '0')).join('')
}
