import { useState, type FC, type KeyboardEvent } from 'react'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { SETTINGS_INPUT_CLASS } from '../../../constants/ui.constants.ts'
import { SettingsSection } from './SettingsSection.tsx'
import type { SettingsSectionProps } from '../types.ts'

/**
 * Секция управления банлистом очереди.
 */
export const QueueBanListSection: FC<SettingsSectionProps> = ({
  titleClassName = '',
  className = '',
}) => {
  const { banPlayerFromQueue, unbanPlayerFromQueue } = useQueue()
  const { settings } = useQueueSettings()
  const banList = settings.banList || []

  const actorUsername = useActorUsername('')

  const [newUsername, setNewUsername] = useState('')

  const handleAddRow = () => {
    const trimmedValue = newUsername.trim()

    if (!trimmedValue) return

    banPlayerFromQueue({
      username: trimmedValue,
      displayedUsername: trimmedValue,
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername,
    })

    setNewUsername('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddRow()
    }
  }

  const handleRemoveRow = (username: string) => {
    unbanPlayerFromQueue({
      username,
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername,
    })
  }

  return (
    <SettingsSection
      className={className}
      spaced
      title="Банлист очереди"
      titleClassName={titleClassName}
    >
      <div className="p-3 rounded-xl bg-base-200/40 border border-base-300 space-y-2 w-full min-w-0">

        {banList.length > 0 && (
          <div className="space-y-2 mb-2">
            {banList.map((username, index) => (
              <div className="flex items-center gap-2 w-full min-w-0" key={index}>
                <input
                  className="input input-bordered input-sm flex-1 min-w-0 text-sm bg-base-300/30 border-base-300 text-base-content/70"
                  disabled
                  type="text"
                  value={username}
                />
                <button
                  className="btn btn-square btn-sm btn-error btn-outline shrink-0"
                  onClick={() => handleRemoveRow(username)}
                  title="Удалить из списка"
                  type="button"
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 w-full min-w-0 border-t border-base-300/30 pt-2 mt-2">
          <input
            className={SETTINGS_INPUT_CLASS}
            onChange={e => setNewUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить никнейм на Twitch..."
            type="text"
            value={newUsername}
          />
          <button
            className="btn btn-square btn-sm btn-primary shrink-0"
            disabled={!newUsername.trim()}
            onClick={handleAddRow}
            title="Добавить в список"
            type="button"
          >
            <LuPlus className="w-4 h-4" />
          </button>
        </div>

      </div>
    </SettingsSection>
  )
}
