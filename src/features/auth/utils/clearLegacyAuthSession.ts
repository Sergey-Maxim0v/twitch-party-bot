import { AUTH_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { removeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Удаляет Twitch-сессию, сохранённую предыдущими версиями приложения в localStorage.
 */
export const clearLegacyAuthSession = (): void => {
  removeWebStorage('localStorage', AUTH_STORAGE_KEYS.LEGACY_SESSION)
}
