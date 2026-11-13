import { useCallback, useEffect, useRef, useState } from 'react'
import { parseStoredValueSafe, readStoredValue, serializeStoredValue } from './utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from './utils/webStorage.utils.ts'

/**
 * Хранит состояние в localStorage и синхронизирует его между вкладками.
 *
 * Сохранённые данные приводятся к структуре `initialValue`; при изменении
 * структуры элемента массива смените ключ (например, на `..._v2`).
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ в localStorage.
 * @param initialValue - Значение по умолчанию и эталон структуры.
 * @returns Текущее значение и функция его обновления.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const initialValueRef = useRef(initialValue)
  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue])

  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue('localStorage', key, initialValue))

  const isFirstRunRef = useRef(true)

  useEffect(() => {
    const serialized = serializeStoredValue('localStorage', key, storedValue)
    const { value: item } = readWebStorage('localStorage', key)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('localStorage', key, serialized)
  }, [key, storedValue])

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

  return [storedValue, setValue]
}
