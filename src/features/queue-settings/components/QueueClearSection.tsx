import type { FC } from 'react'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { DANGER_ACTION_BUTTON_CLASS, SETTINGS_SECTION_SPACED_CLASS } from '../../../constants/ui.constants.ts'

interface QueueClearSectionProps {
  titleClassName?: string;
  className?: string;
}

/**
 * Секция очистки очереди и истории.
 */
export const QueueClearSection: FC<QueueClearSectionProps> = ({ className = '', titleClassName = '' }) => {
  const { clearActiveQueue, clearQueueHistory, clearWaitingQueue } = useQueue()
  const { session, userDisplayName } = useAuth()

  const clearArgs = {
    source: APP_LOG_SOURCES.STREAMER_UI,
    actorUsername: userDisplayName ?? session?.login ?? '',
  }

  return (
    <div
      className={`${SETTINGS_SECTION_SPACED_CLASS} ${className}`}
    >
      <h3 className={titleClassName}>Очистить очередь</h3>

      <div className="form-control w-full flex flex-col gap-2">
        <button
          className={DANGER_ACTION_BUTTON_CLASS}
          onClick={() => { clearActiveQueue(clearArgs) }}
          type="button"
        >
          Очистить текущую очередь
        </button>
        <button
          className={DANGER_ACTION_BUTTON_CLASS}
          onClick={() => { clearWaitingQueue(clearArgs) }}
          type="button"
        >
          Очистить список ожидающих
        </button>
        <button
          className={DANGER_ACTION_BUTTON_CLASS}
          onClick={() => { clearQueueHistory(clearArgs) }}
          type="button"
        >
          Очистить историю
        </button>
      </div>
    </div>
  )
}
