import { type ChangeEvent, type FC, type KeyboardEvent, useState } from 'react'

interface SettingsTextInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const SettingsTextInput: FC<SettingsTextInputProps> = ({
  label,
  value = '',
  onChange,
  placeholder = '',
  max = 100,
  disabled = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(value)
  const [prevValue, setPrevValue] = useState<string>(value)

  if (value !== prevValue) {
    setPrevValue(value)
    setInputValue(value)
  }

  const commitValue = (stringValue: string) => {
    const trimmedValue = stringValue.trim()
    const finalValue = trimmedValue.slice(0, max)

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
        className="input input-bordered w-full input-sm focus:input-primary focus:outline-none text-sm min-w-0"
        disabled={disabled}
        maxLength={max}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type="text"
        value={inputValue}
      />
    </div>
  )
}
