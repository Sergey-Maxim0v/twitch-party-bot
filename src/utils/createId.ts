/**
 * Создаёт уникальный идентификатор с заданным префиксом.
 *
 * @param prefix - Префикс идентификатора.
 * @returns Идентификатор вида `префикс_время_случайная часть`.
 */
export const createId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
