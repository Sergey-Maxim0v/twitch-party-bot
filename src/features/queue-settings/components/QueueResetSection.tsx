import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { DANGER_ACTION_BUTTON_CLASS, SETTINGS_SECTION_CLASS } from '../../../constants/ui.constants.ts'

interface QueueResetSectionProps {
  titleClassName?: string;
  className?: string;
}

/**
 * Секция сброса настроек очереди к значениям по умолчанию.
 */
export const QueueResetSection: FC<QueueResetSectionProps> = ({ titleClassName = '', className = '' }) => {
  const { resetSettings } = useQueueSettings()
  return (
    <div
      className={`${SETTINGS_SECTION_CLASS} ${className}`}
    >
      <h3 className={titleClassName}>Восстановить настройки по умолчанию</h3>

      <button
        className={DANGER_ACTION_BUTTON_CLASS}
        onClick={() => { resetSettings() }}
        type="button"
      >
        Восстановить настройки
      </button>
    </div>
  )
}
