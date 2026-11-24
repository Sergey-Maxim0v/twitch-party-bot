import { type FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import type { QueueListProps } from '../../../components/QueueCollapse.tsx'
import { QueueDropList } from './QueueDropList.tsx'
import { QUEUE_TYPES } from '../types.ts'
import { formatQueueBadge } from '../utils/formatQueueBadge.ts'

/**
 * Список игроков текущей активной очереди.
 */
export const QueueActiveList: FC<QueueListProps> = ({ className = '', onOpenChange, open }) => {
  const { activeQueue } = useQueue()
  const { settings } = useQueueSettings()

  const queueLength = activeQueue?.length ?? 0

  const badgeText = formatQueueBadge({
    maxQueueSize: settings?.maxQueueSize ?? 0,
    queueLength,
  })

  return (
    <QueueDropList
      badge={
        <span
          className="inline-flex h-5 min-w-6 items-center justify-center gap-1 rounded-md border border-base-300/60
            bg-base-200/80 px-1.5 font-mono text-[10px] font-bold tabular-nums text-base-content/60"
        >
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
          {badgeText}
        </span>
      }
      className={className}
      highlightClassName="bg-primary/5 ring-1 ring-primary/15"
      onOpenChange={onOpenChange}
      open={open}
      players={activeQueue}
      queueType={QUEUE_TYPES.ACTIVE}
      title="Текущая очередь"
    />
  )
}
