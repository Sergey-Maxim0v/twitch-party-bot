/**
 * Определяет, открыто ли приложение внутри iframe.
 *
 * @returns `true`, если текущее окно не является верхним.
 */
export const isFramed = (): boolean => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
