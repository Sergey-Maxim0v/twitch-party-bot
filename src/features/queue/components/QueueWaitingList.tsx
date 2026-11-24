import { type FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import type { QueueListProps } from '../../../components/QueueCollapse.tsx'
import { QueueDropList } from './QueueDropList.tsx'
import { QUEUE_TYPES } from '../types.ts'
import { formatQueueBadge } from '../utils/formatQueueBadge.ts'

/**
 * Список игроков, ожидающих своей очереди.
 */
export const QueueWaitingList: FC<QueueListProps> = ({ className = '', onOpenChange, open }) => {
  const { waitingQueue } = useQueue()
  const { settings } = useQueueSettings()

  const queueLength = waitingQueue?.length ?? 0

  const badgeText = formatQueueBadge({
    maxQueueSize: settings?.maxQueueSize ?? 0,
    queueLength,
  })

  return (
    <QueueDropList
      badge={
        <span
          className="inline-flex h-5 min-w-6 items-center justify-center rounded-md border border-base-300/60
            bg-base-200/80 px-1.5 font-mono text-[10px] font-bold tabular-nums text-base-content/55"
        >
          {badgeText}
        </span>
      }
      className={className}
      highlightClassName="bg-warning/5 ring-1 ring-warning/15"
      onOpenChange={onOpenChange}
      open={open}
      players={waitingQueue}
      queueType={QUEUE_TYPES.WAITING}
      title="Список ожидающих"
    />
  )
}
