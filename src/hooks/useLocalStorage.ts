import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Хранит состояние в localStorage и синхронизирует его между вкладками браузера.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ, под которым значение хранится в localStorage.
 * @param initialValue - Значение, используемое при отсутствии данных в хранилище.
 * @returns Кортеж с текущим значением и функцией для его обновления.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Ошибка чтения localStorage по ключу "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(valueToStore => {
        const newValue = value instanceof Function ? value(valueToStore) : value
        window.localStorage.setItem(key, JSON.stringify(newValue))
        return newValue
      })
    } catch (error) {
      console.error(`Ошибка записи в localStorage по ключу "${key}":`, error)
    }
  }, [key])

  // Актуальный initialValue храним в ref, чтобы не переподписывать эффект на каждый рендер объектов
  const initialValueRef = useRef(initialValue)
  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return

      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) : initialValueRef.current
        setStoredValue(newValue)
      } catch (error) {
        console.error(`Ошибка парсинга синхронизированных данных по ключу "${key}":`, error)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key])

  return [storedValue, setValue]
}
