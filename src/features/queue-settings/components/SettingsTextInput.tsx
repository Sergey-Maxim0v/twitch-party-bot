import { type ChangeEvent, type FC, type KeyboardEvent } from 'react'
import {
  INPUT_KEYS,
  SETTINGS_INPUT_ERROR_CLASS,
  SETTINGS_VALIDATION_ERROR_CLASS,
} from '../../../constants/ui.constants.ts'
import { useSyncedInput } from '../../../hooks/useSyncedInput.ts'

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
  const [inputValue, setInputValue] = useSyncedInput(value, String)

  const normalizeValue = (stringValue: string) => stringValue.trim().slice(0, max)
  const validationError = validate?.(normalizeValue(inputValue)) ?? null

  const commitValue = (stringValue: string) => {
    const finalValue = normalizeValue(stringValue)

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
    if (e.key === INPUT_KEYS.ENTER) {
      commitValue(inputValue)
      e.currentTarget.blur()
      return
    }

    if (e.key === INPUT_KEYS.ESCAPE) {
      setInputValue(value)
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
