import {
  TWITCH_AUTH_STATE_STORAGE_KEY,
  TWITCH_AUTH_STATE_STORAGE_KIND,
} from '../../../constants/auth.constants.ts'
import { removeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Удаляет сохранённую попытку входа.
 */
export const clearAuthAttempt = (): void => {
  removeWebStorage(TWITCH_AUTH_STATE_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY)
}
