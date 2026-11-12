/**
 * Проверяет, что значение является непустой строкой.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение — строка хотя бы с одним символом.
 */
export const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
