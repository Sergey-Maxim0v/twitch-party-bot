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
 * Использование аналогично `useState`, но значение переживает перезагрузку страницы.
 * При чтении сохранённые данные автоматически дополняются полями из `initialValue`,
 * поэтому добавление новых полей в код не ломает старые сохранения. Значения
 * несовпадающего типа заменяются дефолтными.
 *
 * Если меняется смысл значения или структура элементов массива (то, что нельзя
 * восстановить по дефолту), достаточно изменить ключ, например на `..._v2`:
 * старые данные будут проигнорированы, а приложение получит значения по умолчанию.
 *
 * @template T - Тип сохраняемого значения.
 * @param key - Ключ, под которым значение хранится в localStorage.
 * @param initialValue - Значение по умолчанию и эталон структуры для недостающих полей.
 * @returns Кортеж с текущим значением и функцией для его обновления.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Актуальный initialValue храним в ref, чтобы не переподписывать эффекты на каждый рендер объектов
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

  // Чиним устаревшие или неполные данные в хранилище, чтобы все вкладки
  // работали с одной актуальной структурой.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return

      const healed = parseStoredValue(item, initialValueRef.current)
      const serialized = JSON.stringify(healed)

      if (serialized !== item) {
        window.localStorage.setItem(key, serialized)
      }
    } catch (error) {
      console.error(`Ошибка обновления localStorage по ключу "${key}":`, error)
    }
  }, [key])

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
