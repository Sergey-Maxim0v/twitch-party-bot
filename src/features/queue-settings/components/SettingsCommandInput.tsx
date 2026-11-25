import { type FC, type KeyboardEvent, useRef } from 'react'
import { QUEUE_COMMAND_NAME_MAX_LENGTH } from '../../../constants/queue.constants.ts'
import {
  SETTINGS_INPUT_CLASS,
  SETTINGS_INPUT_ERROR_CLASS,
  SETTINGS_VALIDATION_ERROR_CLASS,
} from '../../../constants/ui.constants.ts'
import { useSyncedInput } from '../../../hooks/useSyncedInput.ts'

interface SettingsCommandInputProps {
  label: string;
  commandValue: string;
  isModeratorValue: boolean;
  onCommandChange: (value: string) => void;
  /** Сообщает об отказе в сохранении и сбросе введённого значения. */
  onCommandRejected?: (error: string) => void;
  onModeratorChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** Проверяет имя команды и возвращает текст ошибки или `null`. */
  validate?: (value: string) => string | null;
}

/**
 * Поле ввода команды чата с переключателем доступа для модераторов.
 */
export const SettingsCommandInput: FC<SettingsCommandInputProps> = ({
  label,
  commandValue,
  isModeratorValue,
  onCommandChange,
  onCommandRejected,
  onModeratorChange,
  disabled = false,
  className = '',
  validate,
}) => {
  const [localValue, setLocalValue] = useSyncedInput(commandValue, String)
  const rejectedValueRef = useRef<string | null>(null)

  const validationError = validate?.(localValue) ?? null

  const handleInputChange = (value: string) => {
    rejectedValueRef.current = null
    setLocalValue(value)
  }

  const handleSave = () => {
    if (localValue === commandValue) return

    const error = validate?.(localValue)
    if (!error) {
      rejectedValueRef.current = null
      onCommandChange(localValue)
      return
    }

    if (rejectedValueRef.current !== localValue) {
      rejectedValueRef.current = localValue
      onCommandRejected?.(error)
    }

    setLocalValue(commandValue)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      rejectedValueRef.current = null
      setLocalValue(commandValue)
    }
  }

  return (
    <div className={`flex flex-col gap-1 w-full min-w-0 ${className}`}>
      <span
        className={`text-xs font-semibold tracking-wide ${
          disabled ? 'text-base-content/30' : 'text-base-content/60'
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-2 w-full min-w-0">
        <input
          aria-invalid={Boolean(validationError)}
          className={`${SETTINGS_INPUT_CLASS}${validationError ? ` ${SETTINGS_INPUT_ERROR_CLASS}` : ''}`}
          disabled={disabled}
          maxLength={QUEUE_COMMAND_NAME_MAX_LENGTH}
          onBlur={handleSave}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="!команда"
          type="text"
          value={localValue}
        />
        <label
          className={`label cursor-pointer flex items-center gap-1.5 py-0 px-1 shrink-0 ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          title="Только для модераторов"
        >
          <span
            className={`label-text text-xs font-medium select-none ${
              disabled ? 'text-base-content/30' : 'text-base-content/50'
            }`}
          >
            Мод
          </span>
          <input
            checked={isModeratorValue}
            className="checkbox checkbox-primary checkbox-xs shrink-0 focus:input-primary focus:outline-none"
            disabled={disabled}
            onChange={e => {
              onModeratorChange(e.target.checked)
            }}
            type="checkbox"
          />
        </label>
      </div>

      {validationError && (
        <span className={SETTINGS_VALIDATION_ERROR_CLASS}>{validationError}</span>
      )}
    </div>
  )
}
