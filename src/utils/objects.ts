/**
 * Проверяет, что значение является обычным объектом (не массивом и не `null`).
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение — объект с полями.
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Читает собственное поле объекта, не затрагивая свойства прототипа.
 *
 * @param record - Объект с полями.
 * @param key - Имя поля.
 * @returns Значение поля или `undefined`, если поле не является собственным.
 */
export const getOwnValue = <T>(record: Record<string, T>, key: string): T | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined
