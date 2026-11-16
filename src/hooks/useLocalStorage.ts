import { useCallback, useEffect, useRef, useState } from 'react'
import { parseStoredValueSafe, readStoredValue, serializeStoredValue } from './utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from './utils/webStorage.utils.ts'

interface SanitizedValue<T> {
  value: T;
  isInvalid: boolean;
}

/**
 * Хранит состояние в localStorage и синхронизирует его между вкладками.
 *
 * Сохранённые данные приводятся к структуре `initialValue`; при изменении
 * структуры элемента массива смените ключ (например, на `..._v2`).
 * Необязательный `sanitize` проверяет значение, а исправленный вариант
 * записывается обратно в хранилище.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ в localStorage.
 * @param initialValue - Значение по умолчанию и эталон структуры.
 * @param sanitize - Проверка и нормализация сохранённого значения.
 * @returns Текущее значение, функция его обновления и признак некорректного сохранённого значения.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (value: unknown) => SanitizedValue<T>,
): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const initialValueRef = useRef(initialValue)
  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue])

  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue('localStorage', key, initialValue))

  const sanitizedValue = sanitize?.(storedValue)
  const value = sanitizedValue ? sanitizedValue.value : storedValue
  const isInvalid = sanitizedValue ? sanitizedValue.isInvalid : false
  const isFirstRunRef = useRef(true)

  useEffect(() => {
    const serialized = serializeStoredValue('localStorage', key, value)
    const { value: item } = readWebStorage('localStorage', key)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('localStorage', key, serialized)
  }, [key, storedValue, value])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(currentValue => (value instanceof Function ? value(currentValue) : value))
  }, [])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return

      const newValue = event.newValue === null
        ? initialValueRef.current
        : parseStoredValueSafe('localStorage', key, event.newValue, initialValueRef.current)

      setStoredValue(newValue)
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [value, setValue, isInvalid]
}
