/** Проверяет, что значение является обычным объектом (не массивом и не null). */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Приводит сохранённое значение к структуре `defaults`: дополняет недостающие поля
 * и отбрасывает значения несовпадающего типа. Массивы сохраняются как есть,
 * а при `defaults === null` возвращается сохранённое значение.
 *
 * @param defaults - Эталон структуры и значения по умолчанию.
 * @param stored - Значение, прочитанное из localStorage.
 * @returns Значение, соответствующее структуре `defaults`.
 */
export const mergeWithDefaults = <T>(defaults: T, stored: unknown): T => {
  if (defaults === undefined) return stored as T

  if (defaults === null) return (stored === undefined ? defaults : stored) as T

  if (stored === undefined || stored === null) return defaults

  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T
  }

  if (!isPlainObject(defaults)) {
    if (typeof stored !== typeof defaults) return defaults
    if (typeof defaults === 'number' && !Number.isFinite(stored)) return defaults

    return stored as T
  }

  if (!isPlainObject(stored)) return defaults

  const result: Record<string, unknown> = { ...stored }

  Object.entries(defaults).forEach(([field, defaultValue]) => {
    result[field] = mergeWithDefaults(defaultValue, stored[field])
  })

  return result as T
}
