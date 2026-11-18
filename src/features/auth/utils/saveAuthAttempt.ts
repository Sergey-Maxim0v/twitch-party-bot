import {
  TWITCH_AUTH_STATE_STORAGE_KEY,
  TWITCH_AUTH_STATE_STORAGE_KIND,
} from '../../../constants/auth.constants.ts'
import type { AuthAttempt } from '../types'
import { writeWebStorage } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Сохраняет попытку входа (`state`) перед редиректом на Twitch.
 *
 * @param state - Сгенерированное значение `state`.
 * @returns `true`, если попытку удалось сохранить.
 */
export const saveAuthAttempt = (state: string): boolean => (
  writeWebStorage(TWITCH_AUTH_STATE_STORAGE_KIND, TWITCH_AUTH_STATE_STORAGE_KEY, JSON.stringify({
    state,
    createdAt: Date.now(),
  } satisfies AuthAttempt))
)
