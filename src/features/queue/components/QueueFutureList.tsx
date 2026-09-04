import type { FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import QueueCollapse from '../../../components/QueueCollapse.tsx'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import QueueElement from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'

export interface QueueFutureListProps {
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean
}

const QueueFutureList: FC<QueueFutureListProps> = ({ className = '', onOpenChange, open, disabled }) => {
  const { futureQueue } = useQueue()
  const { settings } = useQueueSettings()

  const queueLength = futureQueue?.length ?? 0
  const maxPlayers = settings?.maxQueueSize ?? 0

  const badgeText = maxPlayers > 0 ? `${queueLength} / ${maxPlayers}` : `${queueLength}`
  const isOpen = open && !disabled

  return (
    <QueueCollapse
      badge={
        <span className="badge badge-neutral text-xs font-semibold">{badgeText}</span>
      }
      className={className}
      disabled={disabled}
      onOpenChange={onOpenChange}
      open={isOpen}
      title="Будущая очередь"
      tooltipText={disabled ? 'Будущие очереди отключены в настройках' : undefined}
    >
      <div className="flex flex-col gap-2">
        {futureQueue.map(player => (
          <QueueElement key={player.userId + player.timestamp} player={player} queueType={QUEUE_TYPES.FUTURE} />
        ))}
      </div>
    </QueueCollapse>
  )
}

export default QueueFutureList
