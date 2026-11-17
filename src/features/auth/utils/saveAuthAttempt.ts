import {
  TWITCH_AUTH_STATE_STORAGE_KEY,
  TWITCH_AUTH_STATE_STORAGE_KIND,
} from '../../../constants/auth.constants.ts'
import type { AuthAttempt, AuthContextType } from '../types'
import { writeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Сохраняет попытку входа (`state` + контекст) перед редиректом на Twitch.
 *
 * @param state - Сгенерированное значение `state`.
 * @param contextType - Контекст входа: `popup` или `tab`.
 * @returns `true`, если попытку удалось сохранить.
 */
export const saveAuthAttempt = (state: string, contextType: AuthContextType): boolean => (
  writeWebStorage(TWITCH_AUTH_STATE_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY, JSON.stringify({
    state,
    contextType,
    createdAt: Date.now(),
  } satisfies AuthAttempt))
)
