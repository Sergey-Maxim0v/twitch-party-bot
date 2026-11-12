import { useState, useEffect, useCallback, useRef } from 'react'
import { mergeWithDefaults } from './utils/storage.utils.ts'

/**
 * Приводит сохранённое значение к актуальной структуре.
 *
 * @param raw - Сериализованное значение из localStorage.
 * @param initialValue - Актуальная структура и дефолтные значения.
 * @returns Значение, приведённое к структуре `initialValue`.
 */
const parseStoredValue = <T>(raw: string, initialValue: T): T =>
  mergeWithDefaults(initialValue, JSON.parse(raw))

/**
 * Хранит состояние в localStorage и синхронизирует его между вкладками браузера.
 *
 * Работает как `useState`, но значение переживает перезагрузку. Сохранённые данные
 * приводятся к структуре `initialValue`; при изменении структуры элемента массива
 * смените ключ (например, на `..._v2`).
 *
 * Запись выполняется в эффекте: исключение из функции-апдейтера React не
 * перехватывает и роняет рендер, поэтому ошибки хранилища (например,
 * `QuotaExceededError`) только логируются.
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

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item === null ? initialValue : parseStoredValue(item, initialValue)
    } catch (error) {
      console.error(`Ошибка чтения localStorage по ключу "${key}":`, error)
      return initialValue
    }
  })

  const isFirstRunRef = useRef(true)

  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue)
      const item = window.localStorage.getItem(key)
      const isFirstRun = isFirstRunRef.current
      isFirstRunRef.current = false

      // На монтировании не создаём запись, если её не было; одинаковое значение не перезаписываем.
      if ((isFirstRun && item === null) || item === serialized) return

      window.localStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`Ошибка записи в localStorage по ключу "${key}":`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(currentValue => (value instanceof Function ? value(currentValue) : value))
  }, [])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return

      try {
        const newValue = event.newValue === null
          ? initialValueRef.current
          : parseStoredValue(event.newValue, initialValueRef.current)

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
