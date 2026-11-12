/** Проверяет, что значение является обычным объектом (не массивом и не null). */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Приводит сохранённое значение к структуре `defaults`: дополняет недостающие поля
 * и отбрасывает значения несовпадающего типа. Массивы сохраняются как есть,
 * а при `defaults === null` возвращается сохранённое значение.
 *
 * @param defaults - Эталон структуры и значения по умолчанию.
 * @param stored - Значение, прочитанное из Web Storage.
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

/**
 * Разбирает JSON из Web Storage и приводит его к структуре `defaults`.
 *
 * @param raw - Сериализованное значение.
 * @param defaults - Эталон структуры и значения по умолчанию.
 * @returns Значение, соответствующее структуре `defaults`.
 */
export const parseStoredValue = <T>(raw: string, defaults: T): T =>
  mergeWithDefaults(defaults, JSON.parse(raw))
