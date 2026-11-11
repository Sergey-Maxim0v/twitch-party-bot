import type { FC } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { QueueCollapse } from '../../../components/QueueCollapse.tsx'
import { QueueElement } from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'
import { QUEUE_BADGE_CLASS } from '../../../constants/ui.constants.ts'

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

  const { setNodeRef } = useDroppable({ id: QUEUE_TYPES.ACTIVE })

  const queueLength = activeQueue?.length ?? 0
  const maxPlayers = settings?.maxQueueSize ?? 0

  const badgeText = maxPlayers > 0 ? `${queueLength} / ${maxPlayers}` : `${queueLength}`

  const playerIds = activeQueue.map(p => p.userId)

  return (
    <QueueCollapse
      badge={
        <span className={QUEUE_BADGE_CLASS}>{badgeText}</span>
      }
      className={className}
      onOpenChange={onOpenChange}
      open={open}
      title="Текущая очередь"
    >
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-10" ref={setNodeRef}>
          {activeQueue.map(player => (
            <QueueElement key={player.userId + player.timestamp} player={player} queueType={QUEUE_TYPES.ACTIVE} />
          ))}
        </div>
      </SortableContext>
    </QueueCollapse>
  )
}
