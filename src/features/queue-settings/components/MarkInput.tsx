import { type ChangeEvent, type FC, type KeyboardEvent } from 'react'
import { normalizeMark } from '../utils/normalizeMark.ts'
import { useSyncedInput } from '../../../hooks/useSyncedInput.ts'
import {
  INPUT_KEYS,
  SETTINGS_INPUT_ERROR_CLASS,
  SETTINGS_VALIDATION_ERROR_CLASS,
} from '../../../constants/ui.constants.ts'
import { QUEUE_MARK_MAX_LENGTH, QUEUE_MARK_VALIDATION_MESSAGES } from '../../../constants/queue.constants.ts'
import type { QueueMarkKey } from '../types.ts'

const INPUT_CLASS = 'input input-bordered w-full input-sm focus:input-primary focus:outline-none text-sm min-w-0'

interface MarkInputProps {
  label: string;
  markKey: QueueMarkKey;
  onChange: (key: QueueMarkKey, value: string) => void;
  value: string;
}

/** Компактное поле ввода маркера статуса участника. */
export const MarkInput: FC<MarkInputProps> = ({ label, markKey, onChange, value }) => {
  const [inputValue, setInputValue] = useSyncedInput(value, String)
  const validationError = [...inputValue].length > QUEUE_MARK_MAX_LENGTH
    ? QUEUE_MARK_VALIDATION_MESSAGES.LENGTH
    : null

  const commitValue = (stringValue: string) => {
    const finalValue = normalizeMark(stringValue)

    onChange(markKey, finalValue)
    setInputValue(finalValue)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
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
    <div className="form-control w-full min-w-20 flex-1 basis-20">
      <label className="label py-1 px-0 w-full">
        <span className="label-text text-sm font-medium w-full break-normal whitespace-normal text-base-content/80">
          {label}
        </span>
      </label>

      <input
        aria-invalid={Boolean(validationError)}
        aria-label={label}
        className={`${INPUT_CLASS}${validationError ? ` ${SETTINGS_INPUT_ERROR_CLASS}` : ''}`}
        maxLength={QUEUE_MARK_MAX_LENGTH * 2}
        onBlur={() => { commitValue(inputValue) }}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="text"
        value={inputValue}
      />

      {validationError && (
        <span className={SETTINGS_VALIDATION_ERROR_CLASS}>{validationError}</span>
      )}
    </div>
  )
}
