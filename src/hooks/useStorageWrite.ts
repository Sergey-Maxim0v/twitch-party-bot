import { useEffect, useRef } from 'react'
import { serializeStoredValue } from './utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from './utils/webStorage.utils.ts'

/**
 * Записывает значение в localStorage при изменении.
 *
 * Не создаёт запись на монтировании и не перезаписывает одинаковое значение.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ в localStorage.
 * @param value - Значение для сохранения.
 * @param dependency - Значение, при изменении которого повторяется запись. По умолчанию само значение.
 */
export const useStorageWrite = <T>(key: string, value: T, dependency: unknown = value): void => {
  const isFirstRunRef = useRef(true)

  useEffect(() => {
    const serialized = serializeStoredValue('localStorage', key, value)
    const { value: item } = readWebStorage('localStorage', key)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('localStorage', key, serialized)
  }, [key, value, dependency])
}
