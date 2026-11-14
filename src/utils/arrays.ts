/**
 * Убирает `null` из массива.
 *
 * @param values - Массив значений и `null`.
 * @returns Массив без `null`.
 */
export const filterNotNull = <T>(values: Array<T | null>): T[] =>
  values.filter((value): value is T => value !== null)
