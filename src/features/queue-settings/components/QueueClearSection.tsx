import { useState, type FC } from 'react'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import {
  QUEUE_CLEAR_TARGETS,
  QUEUE_CLEAR_TARGET_UI,
  QUEUE_CLEAR_UI,
  type QueueClearTarget,
} from '../../../constants/queue.constants.ts'
import { DANGER_ACTION_BUTTON_CLASS, SETTINGS_SECTION_SPACED_CLASS } from '../../../constants/ui.constants.ts'
import { QueueClearConfirmModal } from './QueueClearConfirmModal.tsx'

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
  const [pendingTarget, setPendingTarget] = useState<QueueClearTarget | null>(null)

  const clearArgs = {
    source: APP_LOG_SOURCES.STREAMER_UI,
    actorUsername: userDisplayName ?? session?.login ?? '',
  }

  const clearActions: Record<QueueClearTarget, () => void> = {
    active: () => { clearActiveQueue(clearArgs) },
    waiting: () => { clearWaitingQueue(clearArgs) },
    history: () => { clearQueueHistory(clearArgs) },
  }

  /**
   * Выполняет очистку после подтверждения.
   */
  const handleConfirm = (): void => {
    if (!pendingTarget) return

    clearActions[pendingTarget]()
    setPendingTarget(null)
  }

  return (
    <div
      className={`${SETTINGS_SECTION_SPACED_CLASS} ${className}`}
    >
      <h3 className={titleClassName}>{QUEUE_CLEAR_UI.SECTION_TITLE}</h3>

      <div className="form-control w-full flex flex-col gap-2">
        {QUEUE_CLEAR_TARGETS.map(target => (
          <button
            className={DANGER_ACTION_BUTTON_CLASS}
            key={target}
            onClick={() => { setPendingTarget(target) }}
            type="button"
          >
            {QUEUE_CLEAR_TARGET_UI[target].LABEL}
          </button>
        ))}
      </div>

      {pendingTarget && (
        <QueueClearConfirmModal
          onCancel={() => { setPendingTarget(null) }}
          onConfirm={handleConfirm}
          title={QUEUE_CLEAR_TARGET_UI[pendingTarget].QUESTION}
        />
      )}
    </div>
  )
}
