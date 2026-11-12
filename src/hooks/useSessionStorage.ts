import { useCallback, useEffect, useRef, useState } from 'react'
import { parseStoredValue } from './utils/storage.utils.ts'

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
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item === null ? initialValue : parseStoredValue(item, initialValue)
    } catch (error) {
      console.error(`Ошибка чтения sessionStorage по ключу "${key}":`, error)
      return initialValue
    }
  })

  const isFirstRunRef = useRef(true)

  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue)
      const item = window.sessionStorage.getItem(key)
      const isFirstRun = isFirstRunRef.current
      isFirstRunRef.current = false

      // Не создаём запись на монтировании и не перезаписываем одинаковое значение.
      if ((isFirstRun && item === null) || item === serialized) return

      window.sessionStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`Ошибка записи в sessionStorage по ключу "${key}":`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(currentValue => (value instanceof Function ? value(currentValue) : value))
  }, [])

  return [storedValue, setValue]
}
