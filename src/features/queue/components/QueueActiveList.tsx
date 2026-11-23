import type { FC } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { QueueCollapse } from '../../../components/QueueCollapse.tsx'
import { QueueElement } from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'

interface QueueActiveListProps {
  /** Дополнительные CSS-классы списка. */
  className?: string;
  /** Открыт ли список. */
  open: boolean;
  /** Обработчик изменения состояния списка. */
  onOpenChange: (open: boolean) => void;
}

/**
 * Список игроков текущей активной очереди.
 */
export const QueueActiveList: FC<QueueActiveListProps> = ({ className = '', onOpenChange, open }) => {
  const { activeQueue } = useQueue()
  const { settings } = useQueueSettings()

  const { isOver, setNodeRef } = useDroppable({ id: QUEUE_TYPES.ACTIVE })

  const queueLength = activeQueue?.length ?? 0
  const maxPlayers = settings?.maxQueueSize ?? 0

  const badgeText = maxPlayers > 0 ? `${queueLength} / ${maxPlayers}` : `${queueLength}`

  const playerIds = activeQueue.map(player => player.queueEntryId)

  return (
    <QueueCollapse
      badge={
        <span
          className="inline-flex h-5 min-w-6 items-center justify-center gap-1 rounded-md border border-base-300/60
            bg-base-200/80 px-1.5 font-mono text-[10px] font-bold tabular-nums text-base-content/60"
        >
          <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
          {badgeText}
        </span>
      }
      className={`${className} rounded-xl! shadow-xs`}
      onOpenChange={onOpenChange}
      open={open}
      title="Текущая очередь"
    >
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <div
          className={`flex min-h-10 flex-col gap-1.5 rounded-lg transition-colors duration-200
            ${isOver ? 'bg-primary/5 ring-1 ring-primary/15' : ''}`}
          ref={setNodeRef}
        >
          {activeQueue.map(player => (
            <QueueElement key={player.queueEntryId} player={player} queueType={QUEUE_TYPES.ACTIVE} />
          ))}
        </div>
      </SortableContext>
    </QueueCollapse>
  )
}
