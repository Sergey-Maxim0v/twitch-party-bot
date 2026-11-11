/** Проверяет, что значение является обычным объектом (не массивом и не null). */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Приводит сохранённое значение к актуальной структуре, дополняя его полями из `defaults`.
 *
 * Нужен, чтобы данные, записанные старой версией приложения, не ломали новую:
 * отсутствующие поля берутся из значения по умолчанию, а значения несовпадающего
 * типа отбрасываются. Массивы и произвольные записи (например, `playerHistory`)
 * сохраняются как есть.
 *
 * @param defaults - Значение по умолчанию (эталон структуры).
 * @param stored - Значение, прочитанное из localStorage.
 * @returns Значение, соответствующее структуре `defaults`.
 */
export const mergeWithDefaults = <T>(defaults: T, stored: unknown): T => {
  // Явного дефолта нет — доверяем сохранённому значению (например, `null` для сессии).
  if (defaults === undefined) return stored as T

  // Данных нет — используем значение по умолчанию целиком.
  if (stored === undefined || stored === null) return defaults

  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults

    // Неизвестные ключи сохраняем (это пользовательские данные), известные — добиваем дефолтами.
    const result: Record<string, unknown> = { ...stored }

    Object.entries(defaults).forEach(([field, defaultValue]) => {
      result[field] = mergeWithDefaults(defaultValue, stored[field])
    })

    return result as T
  }

  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T
  }

  // Примитивы: при несовпадении типа или невалидном числе откатываемся к дефолту.
  if (typeof stored !== typeof defaults) return defaults
  if (typeof defaults === 'number' && !Number.isFinite(stored)) return defaults

  return stored as T
}
