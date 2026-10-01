import { type FC, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueue } from '../hooks/useQueue.ts'
import QueueCollapse from '../../../components/QueueCollapse.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import QueueElement from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'

export interface QueueWaitingListProps {
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean
}

const QueueWaitingList: FC<QueueWaitingListProps> = ({ className = '', onOpenChange, open, disabled }) => {
  const { waitingQueue } = useQueue()
  const { settings } = useQueueSettings()

  useEffect(() => {
    if(settings.allowPreJoin) {
      onOpenChange(settings.allowPreJoin)
    }
  }, [settings.allowPreJoin, onOpenChange])

  const { setNodeRef } = useDroppable({ id: QUEUE_TYPES.WAITING, disabled: !!disabled })

  const queueLength = waitingQueue?.length ?? 0
  const maxPlayers = settings?.maxQueueSize ?? 0

  const badgeText = maxPlayers > 0 ? `${queueLength} / ${maxPlayers}` : `${queueLength}`
  const isOpen = open && !disabled

  const playerIds = waitingQueue.map(p => p.userId)

  return (
    <QueueCollapse
      badge={
        <span className="badge badge-neutral text-xs font-semibold">{badgeText}</span>
      }
      className={className}
      disabled={disabled}
      onOpenChange={onOpenChange}
      open={isOpen}
      title="Список ожидающих"
      tooltipText={disabled ? 'Список ожидающих отключен в настройках' : undefined}
    >
      <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-10" ref={setNodeRef}>
          {waitingQueue.map(player => (
            <QueueElement key={player.userId + player.timestamp} player={player} queueType={QUEUE_TYPES.WAITING} />
          ))}
        </div>
      </SortableContext>
    </QueueCollapse>
  )
}

export default QueueWaitingList
