import { useState, type FC, type KeyboardEvent } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import { useQueueSettings } from '../hooks/useQueueSettings'
import { useQueue } from '../../queue/hooks/useQueue.ts' // Оставляем только для чтения списка

interface QueueBanListSectionProps {
  titleClassName?: string;
  className?: string;
}

export const QueueBanListSection: FC<QueueBanListSectionProps> = ({
  titleClassName = '',
  className = '',
}) => {
  const { banPlayerFromQueue, unbanPlayerFromQueue } = useQueue()
  const { settings } = useQueueSettings()
  const banList = settings.banList || []

  const { userDisplayName, session } = useAuth()
  const actorUsername = userDisplayName ?? session?.login ?? ''

  const [newUsername, setNewUsername] = useState('')

  const handleAddRow = () => {
    const trimmedValue = newUsername.trim()

    if (!trimmedValue) return

    banPlayerFromQueue({
      username: trimmedValue,
      displayedUsername: trimmedValue,
      source: LOG_SOURCE.STREAMER_UI,
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
      source: LOG_SOURCE.STREAMER_UI,
      actorUsername,
    })
  }

  return (
    <div
      className={`w-full min-w-0 space-y-3 p-3 rounded-xl bg-base-200/50 border border-base-300/60 ${className}`}
    >
      <h3 className={titleClassName}>Банлист очереди</h3>

      <div className="p-3 rounded-xl bg-base-200/40 border border-base-300 space-y-2 w-full min-w-0">

        {/* Список добавленных */}
        {banList.length > 0 && (
          <div className="space-y-2 mb-2">
            {banList.map((username, index) => (
              <div className="flex items-center gap-2 w-full min-w-0" key={index}>
                <input
                  className="input input-bordered input-sm flex-1 min-w-0 text-sm bg-base-300/30 border-base-300 text-base-content/70 cursor-not-allowed"
                  disabled
                  type="text"
                  value={username}
                />
                <button
                  className="btn btn-square btn-sm btn-error btn-outline shrink-0"
                  onClick={() => { handleRemoveRow(username) }} // Передаем username вместо индекса
                  title="Удалить из списка"
                  type="button"
                >
                  <LuTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Инпут добавления */}
        <div className="flex items-center gap-2 w-full min-w-0 border-t border-base-300/30 pt-2 mt-2">
          <input
            className="input input-bordered input-sm flex-1 min-w-0 text-sm focus:input-primary focus:outline-none"
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
    </div>
  )
}
