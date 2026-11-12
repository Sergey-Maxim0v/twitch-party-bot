import { AUTH_STORAGE_KEYS } from '../../../constants/storage.constants.ts'

/**
 * Удаляет Twitch-сессию, сохранённую предыдущими версиями приложения в localStorage.
 */
export const clearLegacyAuthSession = (): void => {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.LEGACY_SESSION)
  } catch (error) {
    console.error('Ошибка удаления устаревшей Twitch-сессии:', error)
  }
}
