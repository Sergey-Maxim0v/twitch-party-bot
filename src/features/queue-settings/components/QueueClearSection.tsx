import { useState, type FC } from 'react'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import {
  QUEUE_CLEAR_TARGETS,
  QUEUE_CLEAR_TARGET_UI,
  QUEUE_CLEAR_UI,
  type QueueClearTarget,
} from '../../../constants/queue.constants.ts'
import { DANGER_ACTION_BUTTON_CLASS } from '../../../constants/ui.constants.ts'
import { QueueClearConfirmModal } from './QueueClearConfirmModal.tsx'
import { SettingsSection } from './SettingsSection.tsx'
import type { SettingsSectionProps } from '../types.ts'

/**
 * Секция очистки очереди и истории: очистка активной очереди подтягивает ожидающих.
 */
export const QueueClearSection: FC<SettingsSectionProps> = ({ className = '', titleClassName = '' }) => {
  const { balanceQueues, clearActiveQueue, clearQueueHistory, clearWaitingQueue } = useQueue()
  const actorUsername = useActorUsername('')
  const [pendingTarget, setPendingTarget] = useState<QueueClearTarget | null>(null)

  const clearArgs = {
    source: APP_LOG_SOURCES.STREAMER_UI,
    actorUsername,
  }

  const clearActions: Record<QueueClearTarget, () => void> = {
    active: () => {
      clearActiveQueue(clearArgs)
      balanceQueues(clearArgs)
    },
    waiting: () => clearWaitingQueue(clearArgs),
    history: () => clearQueueHistory(clearArgs),
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
    <SettingsSection
      className={className}
      spaced
      title={QUEUE_CLEAR_UI.SECTION_TITLE}
      titleClassName={titleClassName}
    >
      <div className="form-control w-full flex flex-col gap-2">
        {QUEUE_CLEAR_TARGETS.map(target => (
          <button
            className={DANGER_ACTION_BUTTON_CLASS}
            key={target}
            onClick={() => setPendingTarget(target)}
            type="button"
          >
            {QUEUE_CLEAR_TARGET_UI[target].LABEL}
          </button>
        ))}
      </div>

      {pendingTarget && (
        <QueueClearConfirmModal
          onCancel={() => setPendingTarget(null)}
          onConfirm={handleConfirm}
          title={QUEUE_CLEAR_TARGET_UI[pendingTarget].QUESTION}
        />
      )}
    </SettingsSection>
  )
}
