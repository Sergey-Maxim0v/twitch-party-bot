import { validateChannelName } from './validateChannelName.ts'

/**
 * Результат проверки сохранённого канала.
 */
interface ParsedActiveChannel {
  value: string | null;
  isInvalid: boolean;
}

/**
 * Проверяет сохранённое значение канала и приводит его к каноническому виду.
 *
 * @param value - Значение из хранилища.
 * @returns Имя канала либо `null` и признак некорректного значения.
 */
export const parseActiveChannel = (value: unknown): ParsedActiveChannel => {
  if (value === null) return { value: null, isInvalid: false }
  if (typeof value !== 'string') return { value: null, isInvalid: true }
  if (!validateChannelName(value)) return { value: null, isInvalid: true }

  return { value: value.trim().toLowerCase(), isInvalid: false }
}
