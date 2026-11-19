import { type ChangeEvent, type FC, type KeyboardEvent, useState } from 'react'
import {
  SETTINGS_INPUT_ERROR_CLASS,
  SETTINGS_VALIDATION_ERROR_CLASS,
} from '../../../constants/ui.constants.ts'

interface SettingsTextInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
  className?: string;
  /** Проверяет значение и возвращает текст ошибки или `null`. */
  validate?: (value: string) => string | null;
}

const INPUT_CLASS = 'input input-bordered w-full input-sm focus:input-primary focus:outline-none text-sm min-w-0'

/**
 * Текстовое поле настройки.
 */
export const SettingsTextInput: FC<SettingsTextInputProps> = ({
  label,
  value = '',
  onChange,
  placeholder = '',
  max = 100,
  disabled = false,
  className = '',
  validate,
}) => {
  const [inputValue, setInputValue] = useState<string>(value)
  const [prevValue, setPrevValue] = useState<string>(value)

  // Синхронизируем локальное значение, если проп изменился извне.
  if (value !== prevValue) {
    setPrevValue(value)
    setInputValue(value)
  }

  const normalizedValue = inputValue.trim().slice(0, max)
  const validationError = validate?.(normalizedValue) ?? null

  const commitValue = (stringValue: string) => {
    const finalValue = stringValue.trim().slice(0, max)

    if (validate?.(finalValue)) return

    onChange(finalValue)
    setInputValue(finalValue)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleBlur = () => {
    commitValue(inputValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue(inputValue)
      e.currentTarget.blur()
    }
  }

  return (
    <div className={`form-control w-full min-w-0 ${className}`}>
      <label className={`label py-1 px-0 w-full ${disabled ? 'cursor-not-allowed' : ''}`}>
        <span
          className={`label-text text-sm font-medium w-full break-normal whitespace-normal 
                    ${disabled ? 'text-base-content/40' : 'text-base-content/80'}`}
        >
          {label}
        </span>
      </label>

      <input
        aria-invalid={Boolean(validationError)}
        className={`${INPUT_CLASS}${validationError ? ` ${SETTINGS_INPUT_ERROR_CLASS}` : ''}`}
        disabled={disabled}
        maxLength={max}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={inputValue}
      />

      {validationError && (
        <span className={SETTINGS_VALIDATION_ERROR_CLASS}>{validationError}</span>
      )}
    </div>
  )
}
