import { useCallback, useEffect, useRef, useState } from 'react'
import { parseStoredValueSafe, readStoredValue, serializeStoredValue } from './utils/storage.utils.ts'
import { sanitizeStoredValue } from './utils/sanitizeStoredValue.ts'
import { readWebStorage, writeWebStorage } from './utils/webStorage.utils.ts'
import type { LocalStorageOptions, SanitizedValue } from './types/storage.types.ts'

/**
 * Хранит состояние в localStorage и синхронизирует его между вкладками.
 *
 * Сохранённые данные приводятся к структуре `initialValue`. При изменении
 * структуры элемента массива смените ключ (например, на `..._v2`).
 * Необязательный `sanitize` проверяет значение после чтения и перед записью,
 * а исправленное значение записывается обратно в хранилище.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ в localStorage.
 * @param initialValue - Значение по умолчанию и эталон структуры.
 * @param options - Проверка и нормализация значения.
 * @returns Текущее значение, функция его обновления и признак некорректного значения.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  { sanitize }: LocalStorageOptions<T> = {},
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const initialValueRef = useRef(initialValue)
  const sanitizeRef = useRef(sanitize)

  useEffect(() => {
    initialValueRef.current = initialValue
    sanitizeRef.current = sanitize
  }, [initialValue, sanitize])

  const [storedValue, setStoredValue] = useState<SanitizedValue<T>>(() => (
    sanitizeStoredValue(readStoredValue('localStorage', key, initialValue), sanitize)
  ))

  const isFirstRunRef = useRef(true)

  useEffect(() => {
    const serialized = serializeStoredValue('localStorage', key, storedValue.value)
    const { value: item } = readWebStorage('localStorage', key)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('localStorage', key, serialized)
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(currentValue => {
      const nextValue = value instanceof Function ? value(currentValue.value) : value
      const sanitizedValue = sanitizeStoredValue(nextValue, sanitizeRef.current)
      const isUnchanged = Object.is(sanitizedValue.value, currentValue.value)
        && sanitizedValue.isInvalid === currentValue.isInvalid

      return isUnchanged ? currentValue : sanitizedValue
    })
  }, [])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return

      const newValue = event.newValue === null
        ? initialValueRef.current
        : parseStoredValueSafe('localStorage', key, event.newValue, initialValueRef.current)

      setStoredValue(sanitizeStoredValue(newValue, sanitizeRef.current))
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue.value, setValue, storedValue.isInvalid]
}
