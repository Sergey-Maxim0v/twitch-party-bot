import { WEB_STORAGE_ERRORS } from '../../constants/storage.constants.ts'
import { readWebStorage, type WebStorageKind } from './webStorage.utils.ts'

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

/**
 * Разбирает значение из Web Storage без выброса исключений.
 *
 * @template T - Тип сохраняемого значения.
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @param raw - Сериализованное значение.
 * @param defaults - Значение по умолчанию и эталон структуры.
 * @returns Разобранное значение или `defaults` при ошибке.
 */
export const parseStoredValueSafe = <T>(kind: WebStorageKind, key: string, raw: string, defaults: T): T => {
  try {
    return parseStoredValue(raw, defaults)
  } catch (error) {
    console.error(`${WEB_STORAGE_ERRORS.PARSE} по ключу "${key}" (${kind}):`, error)
    return defaults
  }
}

/**
 * Читает и разбирает значение из Web Storage без выброса исключений.
 *
 * @template T - Тип сохраняемого значения.
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @param defaults - Значение по умолчанию и эталон структуры.
 * @returns Сохранённое значение или `defaults` при ошибке.
 */
export const readStoredValue = <T>(kind: WebStorageKind, key: string, defaults: T): T => {
  const { value } = readWebStorage(kind, key)

  return value === null ? defaults : parseStoredValueSafe(kind, key, value, defaults)
}

/**
 * Сериализует значение для Web Storage без выброса исключений.
 *
 * @template T - Тип сохраняемого значения.
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @param value - Сохраняемое значение.
 * @returns JSON-строка или `null` при ошибке.
 */
export const serializeStoredValue = <T>(kind: WebStorageKind, key: string, value: T): string | null => {
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.error(`${WEB_STORAGE_ERRORS.SERIALIZE} по ключу "${key}" (${kind}):`, error)
    return null
  }
}
