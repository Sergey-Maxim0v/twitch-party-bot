import type { ChangeEvent, FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { QUEUE_GAME_DISPLAY_NAMES, QUEUE_GAME_NICKNAME_PATTERNS } from '../../../constants/queue.constants.ts'
import type { QueueGameKey, SettingsSectionProps } from '../types.ts'
import { SettingsSection } from './SettingsSection.tsx'

/**
 * Секция выбора игры и проверки игрового никнейма.
 */
export const QueueGameSection: FC<SettingsSectionProps> = ({
  className = '',
  titleClassName = '',
}) => {
  const { settings, updateSettings } = useQueueSettings()

  const handleGameChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value as QueueGameKey | ''

    if (!selectedKey) {
      updateSettings({ currentGame: undefined })
      return
    }

    updateSettings({
      currentGame: {
        key: selectedKey,
      },
    })
  }

  return (
    <SettingsSection
      className={className}
      spaced
      title="Валидация никнеймов для игры"
      titleClassName={titleClassName}
    >
      <div className="flex flex-col gap-1 w-full min-w-0">
        <select
          className="select select-bordered select-sm w-full
                    focus:select-primary focus:outline-none focus:ring-0 focus:ring-offset-0 outline-none
                    text-sm mt-1"
          onChange={handleGameChange}
          value={settings.currentGame?.key || ''}
        >
          <option value="">—</option>

          {Object.entries(QUEUE_GAME_DISPLAY_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>

        <p className="text-[11px] text-base-content/50 mt-1 break-all h-1">
          Активный паттерн:
          {settings.currentGame ? (
            <code className="bg-base-300 px-1 rounded text-primary">
              {QUEUE_GAME_NICKNAME_PATTERNS[settings.currentGame.key]}
            </code>
          ) : ' не выбрано'}
        </p>
      </div>
    </SettingsSection>
  )
}
