import { type FC, useState, type KeyboardEvent } from 'react'
import { SETTINGS_INPUT_CLASS } from '../../../constants/ui.constants.ts'

interface SettingsCommandInputProps {
  label: string;
  commandValue: string;
  isModeratorValue: boolean;
  onCommandChange: (value: string) => void;
  onModeratorChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Поле ввода команды чата с переключателем доступа для модераторов.
 */
export const SettingsCommandInput: FC<SettingsCommandInputProps> = ({
  label,
  commandValue,
  isModeratorValue,
  onCommandChange,
  onModeratorChange,
  disabled = false,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(commandValue)
  const [prevCommandValue, setPrevCommandValue] = useState(commandValue)

  // Синхронизируем локальное значение, если проп изменился извне.
  if (commandValue !== prevCommandValue) {
    setLocalValue(commandValue)
    setPrevCommandValue(commandValue)
  }

  const handleSave = () => {
    if (localValue !== commandValue) {
      onCommandChange(localValue)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
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
          className={SETTINGS_INPUT_CLASS}
          disabled={disabled}
          onBlur={handleSave}
          onChange={e => setLocalValue(e.target.value)}
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
    </div>
  )
}
