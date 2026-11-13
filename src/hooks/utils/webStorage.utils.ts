import { WEB_STORAGE_ERRORS, WEB_STORAGE_PROBE } from '../../constants/storage.constants.ts'

export type WebStorageKind = 'localStorage' | 'sessionStorage'

/**
 * Результат чтения из Web Storage.
 */
export interface WebStorageReadResult {
  value: string | null;
  isAvailable: boolean;
}

const availability = new Map<WebStorageKind, boolean>()
const reportedErrors = new Set<string>()

/**
 * Проверяет, что ошибка вызвана переполнением хранилища, а не запретом доступа.
 *
 * @param error - Пойманная ошибка.
 * @returns `true` для `QuotaExceededError`.
 */
const isQuotaError = (error: unknown): boolean => (
  typeof DOMException !== 'undefined'
  && error instanceof DOMException
  && error.name === 'QuotaExceededError'
)

/**
 * Пишет ошибку доступа к хранилищу в консоль только один раз.
 *
 * @param message - Описание операции.
 * @param kind - Тип хранилища.
 * @param key - Ключ, с которым выполнялась операция.
 * @param error - Пойманная ошибка.
 */
const reportError = (message: string, kind: WebStorageKind, key: string | null, error: unknown): void => {
  const errorId = `${message}:${kind}:${key ?? ''}`

  if (reportedErrors.has(errorId)) return

  reportedErrors.add(errorId)
  console.error(`${message}${key ? ` по ключу "${key}"` : ''} (${kind}):`, error)
}

/**
 * Помечает хранилище недоступным до перезагрузки страницы.
 *
 * @param kind - Тип хранилища.
 */
const markUnavailable = (kind: WebStorageKind): void => {
  availability.set(kind, false)
}

/**
 * Возвращает Web Storage, если браузер разрешает к нему доступ.
 *
 * @param kind - Тип хранилища.
 * @returns Объект хранилища или `null`.
 */
const getStorage = (kind: WebStorageKind): Storage | null => {
  if (availability.get(kind) === false) return null

  try {
    return window[kind]
  } catch (error) {
    reportError(WEB_STORAGE_ERRORS.ACCESS, kind, null, error)
    markUnavailable(kind)
    return null
  }
}

/**
 * Читает значение из Web Storage без выброса исключений.
 *
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @returns Значение и признак доступности хранилища.
 */
export const readWebStorage = (kind: WebStorageKind, key: string): WebStorageReadResult => {
  const storage = getStorage(kind)

  if (!storage) return { value: null, isAvailable: false }

  try {
    return { value: storage.getItem(key), isAvailable: true }
  } catch (error) {
    reportError(WEB_STORAGE_ERRORS.READ, kind, key, error)
    markUnavailable(kind)

    return { value: null, isAvailable: false }
  }
}

/**
 * Записывает значение в Web Storage без выброса исключений.
 *
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @param value - Сохраняемое значение.
 * @returns `true`, если запись удалась.
 */
export const writeWebStorage = (kind: WebStorageKind, key: string, value: string): boolean => {
  const storage = getStorage(kind)

  if (!storage) return false

  try {
    storage.setItem(key, value)

    return true
  } catch (error) {
    reportError(WEB_STORAGE_ERRORS.WRITE, kind, key, error)

    if (!isQuotaError(error)) {
      markUnavailable(kind)
    }

    return false
  }
}

/**
 * Удаляет значение из Web Storage без выброса исключений.
 *
 * @param kind - Тип хранилища.
 * @param key - Ключ записи.
 * @returns `true`, если удаление удалось.
 */
export const removeWebStorage = (kind: WebStorageKind, key: string): boolean => {
  const storage = getStorage(kind)

  if (!storage) return false

  try {
    storage.removeItem(key)

    return true
  } catch (error) {
    reportError(WEB_STORAGE_ERRORS.REMOVE, kind, key, error)
    markUnavailable(kind)

    return false
  }
}

/**
 * Проверяет возможность записи в Web Storage.
 *
 * @param kind - Тип хранилища.
 * @returns `true`, если браузер разрешает чтение и запись.
 */
export const isWebStorageAvailable = (kind: WebStorageKind): boolean => {
  const cachedAvailability = availability.get(kind)

  if (cachedAvailability !== undefined) return cachedAvailability

  const storage = getStorage(kind)

  if (!storage) return false

  const probeKey = `${WEB_STORAGE_PROBE.KEY}:${kind}`

  try {
    storage.setItem(probeKey, WEB_STORAGE_PROBE.VALUE)
    const isAvailable = storage.getItem(probeKey) === WEB_STORAGE_PROBE.VALUE
    storage.removeItem(probeKey)
    availability.set(kind, isAvailable)

    return isAvailable
  } catch (error) {
    reportError(WEB_STORAGE_ERRORS.ACCESS, kind, probeKey, error)
    markUnavailable(kind)

    return false
  }
}
