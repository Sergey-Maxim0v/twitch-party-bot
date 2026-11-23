import { type FC } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueue } from '../hooks/useQueue.ts'
import { QueueCollapse } from '../../../components/QueueCollapse.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { QueueElement } from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'
import { formatQueueBadge } from '../utils/formatQueueBadge.ts'

interface QueueWaitingListProps {
  /** Дополнительные CSS-классы списка. */
  className?: string;
  /** Открыт ли список. */
  open: boolean;
  /** Обработчик изменения состояния списка. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Список игроков, ожидающих своей очереди.
 */
export const QueueWaitingList: FC<QueueWaitingListProps> = ({ className = '', onOpenChange, open }) => {
  const { waitingQueue } = useQueue()
  const { settings } = useQueueSettings()

  const { isOver, setNodeRef } = useDroppable({ id: QUEUE_TYPES.WAITING })

  const queueLength = waitingQueue?.length ?? 0

  const badgeText = formatQueueBadge({
    maxQueueSize: settings?.maxQueueSize ?? 0,
    queueLength,
  })

  const playerIds = waitingQueue.map(player => player.queueEntryId)

  return (
    <QueueCollapse
      badge={
        <span
          className="inline-flex h-5 min-w-6 items-center justify-center rounded-md border border-base-300/60
            bg-base-200/80 px-1.5 font-mono text-[10px] font-bold tabular-nums text-base-content/55"
        >
          {badgeText}
        </span>
      }
      className={`${className} rounded-xl! shadow-xs`}
      onOpenChange={onOpenChange}
      open={open}
      title="Список ожидающих"
    >
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <div
          className={`flex min-h-10 flex-col gap-1.5 rounded-lg transition-colors duration-200
            ${isOver ? 'bg-warning/5 ring-1 ring-warning/15' : ''}`}
          ref={setNodeRef}
        >
          {waitingQueue.map(player => (
            <QueueElement key={player.queueEntryId} player={player} queueType={QUEUE_TYPES.WAITING} />
          ))}
        </div>
      </SortableContext>
    </QueueCollapse>
  )
}
