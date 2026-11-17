import type { SanitizedValue } from '../types/storage.types.ts'

/**
 * Применяет проверку к значению для localStorage.
 * Без проверки значение считается корректным.
 *
 * @template T - Тип сохраняемого значения.
 * @param value - Проверяемое значение.
 * @param sanitize - Проверка и нормализация значения.
 * @returns Проверенное значение и признак некорректности.
 */
export const sanitizeStoredValue = <T>(
  value: unknown,
  sanitize?: (value: unknown) => SanitizedValue<T>,
): SanitizedValue<T> => (sanitize ? sanitize(value) : { value: value as T, isInvalid: false })
