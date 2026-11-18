import type { AuthAttempt } from '../types'
import { isFilledString } from '../../../utils/strings.ts'

/**
 * Восстанавливает попытку входа из записи хранилища.
 *
 * @param value - Значение из хранилища.
 * @returns Попытка входа или `null`, если запись повреждена.
 */
export const parseAuthAttempt = (value: string | null): AuthAttempt | null => {
  if (!value) return null

  try {
    const { state, createdAt } = JSON.parse(value) as Partial<AuthAttempt>

    if (!isFilledString(state) || typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null

    return { state, createdAt }
  } catch {
    return null
  }
}
