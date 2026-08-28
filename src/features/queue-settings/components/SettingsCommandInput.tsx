import type { FC } from 'react'

interface SettingsCommandInputProps {
  label: string;
  commandValue: string;
  isModeratorValue: boolean;
  onCommandChange: (value: string) => void;
  onModeratorChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsCommandInput: FC<SettingsCommandInputProps> = ({
  label,
  commandValue,
  isModeratorValue,
  onCommandChange,
  onModeratorChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full min-w-0 ${className}`}>
      <span className={`text-xs font-semibold tracking-wide 
                ${disabled ? 'text-base-content/30' : 'text-base-content/60'}`}
      >
        {label}
      </span>

      <div className="flex items-center gap-2 w-full min-w-0">
        <input
          className="input input-bordered input-sm flex-1 min-w-0 text-sm focus:input-primary focus:outline-none"
          disabled={disabled}
          onChange={e => { onCommandChange(e.target.value) }}
          placeholder="!команда"
          type="text"
          value={commandValue}
        />

        <label
          className={`label cursor-pointer flex items-center gap-1.5 py-0 px-1 shrink-0 
                    ${disabled ? 'cursor-not-allowed' : ''}`}
          title="Только для модераторов"
        >
          <span
            className={`label-text text-xs font-medium select-none 
                        ${disabled ? 'text-base-content/30' : 'text-base-content/50'}`}
          >
            Мод
          </span>
          <input
            checked={isModeratorValue}
            className="checkbox checkbox-primary checkbox-xs shrink-0 focus:input-primary focus:outline-none"
            disabled={disabled}
            onChange={e => { onModeratorChange(e.target.checked) }}
            type="checkbox"
          />
        </label>
      </div>
    </div>
  )
}
