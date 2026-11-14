/**
 * Управляющие символы, недопустимые в пользовательских строках.
 */
// eslint-disable-next-line no-control-regex -- поиск управляющих символов и есть цель выражения
export const CONTROL_CHARACTERS_REGEX = /[\u0000-\u001F\u007F]/

/**
 * Проверяет, что значение является непустой строкой.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение — строка хотя бы с одним символом.
 */
export const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

/**
 * Проверяет наличие управляющих символов в строке.
 *
 * @param value - Проверяемая строка.
 * @returns `true`, если строка содержит управляющие символы.
 */
export const hasControlCharacters = (value: string): boolean => CONTROL_CHARACTERS_REGEX.test(value)
