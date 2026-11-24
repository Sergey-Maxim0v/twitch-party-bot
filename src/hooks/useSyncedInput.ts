import { useState } from 'react'

/**
 * Хранит локальное значение поля ввода и синхронизирует его с внешним пропом.
 *
 * @template T - Тип внешнего значения.
 * @param value - Внешнее значение поля.
 * @param toInput - Преобразование внешнего значения в строку ввода.
 * @returns Текущее строковое значение и функция его изменения.
 */
export const useSyncedInput = <T>(
  value: T,
  toInput: (value: T) => string,
): [string, (value: string) => void] => {
  const [inputValue, setInputValue] = useState<string>(() => toInput(value))
  const [prevValue, setPrevValue] = useState<T>(value)

  // Синхронизируем локальное значение, если проп изменился извне.
  if (value !== prevValue) {
    setPrevValue(value)
    setInputValue(toInput(value))
  }

  return [inputValue, setInputValue]
}
