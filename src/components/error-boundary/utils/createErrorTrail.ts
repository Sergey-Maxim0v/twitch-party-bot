import { createErrorRecord, readErrorTrail, type ErrorRecord } from '../../../utils/errorReporter.ts'

/**
 * Формирует журнал ошибок, начиная с текущей.
 *
 * @param error - Пойманная ошибка.
 * @param source - Источник ошибки.
 * @returns Записи журнала от новых к старым.
 */
export const createErrorTrail = (error: unknown, source: string): ErrorRecord[] => (
  readErrorTrail(createErrorRecord(error, source))
)
