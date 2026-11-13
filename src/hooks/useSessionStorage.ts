import { useCallback, useEffect, useRef, useState } from 'react'
import { readStoredValue, serializeStoredValue } from './utils/storage.utils.ts'
import { readWebStorage, writeWebStorage } from './utils/webStorage.utils.ts'

/**
 * Хранит состояние в sessionStorage текущей вкладки.
 *
 * Данные переживают перезагрузку страницы, но не синхронизируются
 * между вкладками и удаляются при её закрытии.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ в sessionStorage.
 * @param initialValue - Значение по умолчанию и эталон структуры.
 * @returns Текущее значение и функция его обновления.
 */
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue('sessionStorage', key, initialValue))

  const isFirstRunRef = useRef(true)

  useEffect(() => {
    const serialized = serializeStoredValue('sessionStorage', key, storedValue)
    const { value: item } = readWebStorage('sessionStorage', key)
    const isFirstRun = isFirstRunRef.current
    isFirstRunRef.current = false

    if (serialized === null || (isFirstRun && item === null) || item === serialized) return

    writeWebStorage('sessionStorage', key, serialized)
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(currentValue => (value instanceof Function ? value(currentValue) : value))
  }, [])

  return [storedValue, setValue]
}
