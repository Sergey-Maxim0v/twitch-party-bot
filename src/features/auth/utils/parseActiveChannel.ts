import { validateChannelName } from './validateChannelName.ts'
import type { SanitizedValue } from '../../../hooks/types/storage.types.ts'

/**
 * Проверяет сохранённое значение канала и приводит его к каноническому виду.
 *
 * @param value - Значение из хранилища.
 * @returns Имя канала либо `null` и признак некорректного значения.
 */
export const parseActiveChannel = (value: unknown): SanitizedValue<string | null> => {
  if (value === null) return { value: null, isInvalid: false }
  if (typeof value !== 'string') return { value: null, isInvalid: true }
  if (!validateChannelName(value)) return { value: null, isInvalid: true }

  return { value: value.trim().toLowerCase(), isInvalid: false }
}
