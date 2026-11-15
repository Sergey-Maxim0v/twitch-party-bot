import { ERROR_SOURCES, ERROR_STORAGE_KEY, ERROR_STORAGE_LIMIT } from '../constants/error.constants.ts'
import { parseStoredValueSafe, serializeStoredValue } from '../hooks/utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from '../hooks/utils/webStorage.utils.ts'

/**
 * Запись журнала ошибок текущей сессии.
 */
export interface ErrorRecord {
  /** Момент возникновения ошибки в миллисекундах. */
  timestamp: number;
  /** Источник ошибки. */
  source: string;
  /** Текст ошибки. */
  message: string;
  /** Стек вызовов. */
  stack?: string;
  /** Стек компонентов React. */
  componentStack?: string;
}

const reportedErrors = new WeakSet<object>()

/**
 * Отмечает ошибку как отражённую и проверяет, не сообщали ли о ней раньше.
 *
 * @param error - Проверяемая ошибка.
 * @returns `true`, если об этой ошибке уже сообщали.
 */
const markAsReported = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false
  if (reportedErrors.has(error)) return true

  reportedErrors.add(error)

  return false
}

/**
 * Читает журнал ошибок текущей сессии.
 *
 * @returns Список записей журнала, от новых к старым.
 */
const readErrorRecords = (): ErrorRecord[] => {
  const { value } = readWebStorage('sessionStorage', ERROR_STORAGE_KEY)

  if (value === null) return []

  return parseStoredValueSafe('sessionStorage', ERROR_STORAGE_KEY, value, [] as ErrorRecord[])
}

/**
 * Сохраняет запись в журнале ошибок текущей сессии.
 *
 * @param record - Сохраняемая запись.
 */
const storeErrorRecord = (record: ErrorRecord): void => {
  const records = [record, ...readErrorRecords()].slice(0, ERROR_STORAGE_LIMIT)
  const serialized = serializeStoredValue('sessionStorage', ERROR_STORAGE_KEY, records)

  if (serialized === null) return

  writeWebStorage('sessionStorage', ERROR_STORAGE_KEY, serialized)
}

/**
 * Собирает запись журнала из ошибки.
 *
 * @param error - Ошибка.
 * @param source - Источник ошибки.
 * @param componentStack - Стек компонентов React, если он доступен.
 * @returns Запись журнала.
 */
export const createErrorRecord = (
  error: unknown,
  source: string,
  componentStack?: string | null,
): ErrorRecord => {
  const isError = error instanceof Error

  return {
    timestamp: Date.now(),
    source,
    message: isError ? error.message : String(error),
    stack: isError ? error.stack : undefined,
    componentStack: componentStack ?? undefined,
  }
}

/**
 * Сообщает об ошибке: выводит её в консоль и сохраняет в журнале сессии.
 *
 * @param error - Ошибка.
 * @param source - Источник ошибки.
 * @param componentStack - Стек компонентов React, если он доступен.
 */
export const reportError = (error: unknown, source: string, componentStack?: string | null): void => {
  if (markAsReported(error)) return

  const record = createErrorRecord(error, source, componentStack)

  console.error(`[${record.source}] ${record.message}`, error)

  storeErrorRecord(record)
}

/**
 * Возвращает журнал ошибок сессии, начиная с текущей ошибки.
 *
 * @param current - Текущая ошибка, которую нужно показать первой.
 * @returns Список записей журнала.
 */
export const readErrorTrail = (current?: ErrorRecord | null): ErrorRecord[] => {
  const records = readErrorRecords()

  if (!current) return records

  return [current, ...records.filter(record => record.message !== current.message)]
}

/**
 * Обрабатывает необработанные ошибки скриптов.
 *
 * @param event - Событие ошибки окна.
 */
const handleWindowError = (event: ErrorEvent): void => {
  if (!event.error) return

  reportError(event.error, ERROR_SOURCES.WINDOW)
}

/**
 * Обрабатывает отклонённые промисы без обработчика.
 *
 * @param event - Событие отклонённого промиса.
 */
const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
  reportError(event.reason, ERROR_SOURCES.PROMISE)
}

/**
 * Подписывается на необработанные ошибки и отклонённые промисы.
 */
export const installGlobalErrorHandlers = (): void => {
  window.addEventListener('error', handleWindowError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
}
