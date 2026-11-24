import { type FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { DANGER_ACTION_BUTTON_CLASS } from '../../../constants/ui.constants.ts'
import type { SettingsSectionProps } from '../types.ts'
import { SettingsSection } from './SettingsSection.tsx'

/**
 * Секция сброса настроек очереди к значениям по умолчанию.
 */
export const QueueResetSection: FC<SettingsSectionProps> = ({ titleClassName = '', className = '' }) => {
  const { resetSettings } = useQueueSettings()
  return (
    <SettingsSection
      className={className}
      title="Восстановить настройки по умолчанию"
      titleClassName={titleClassName}
    >
      <button
        className={DANGER_ACTION_BUTTON_CLASS}
        onClick={() => resetSettings()}
        type="button"
      >
        Восстановить настройки
      </button>
    </SettingsSection>
  )
}
