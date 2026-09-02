import type { FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import QueueCollapse from '../../../components/QueueCollapse.tsx'
import QueueElement from './QueueElement.tsx'

export interface QueueActiveListProps {
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QueueActiveList: FC<QueueActiveListProps> = ({ className = '', onOpenChange, open }) => {
  const { activeQueue } = useQueue()
  const { settings } = useQueueSettings()

  const queueLength = activeQueue?.length ?? 0
  const maxPlayers = settings?.maxQueueSize ?? 0

  const badgeText = maxPlayers > 0 ? `${queueLength} / ${maxPlayers}` : `${queueLength}`

  return (
    <QueueCollapse
      badge={
        <span className="badge badge-neutral text-xs font-semibold ">{badgeText}</span>
      }
      className={className}
      onOpenChange={onOpenChange}
      open={open}
      title="Текущая очередь"
    >
      <div className="flex flex-col gap-2">
        {activeQueue.map(player => (
          <QueueElement key={player.userId + player.timestamp} player={player} />
        ))}
      </div>
    </QueueCollapse>
  )
}

export default QueueActiveList
