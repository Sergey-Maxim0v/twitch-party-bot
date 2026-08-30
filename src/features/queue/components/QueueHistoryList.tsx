import type { FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import QueueCollapse from '../../../components/QueueCollapse.tsx'

export interface QueueHistoryListProps {
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QueueHistoryList: FC<QueueHistoryListProps> = ({ className = '', onOpenChange, open }) => {
  const { queueHistory } = useQueue()

  const queueLength = queueHistory?.length ?? 0

  return (
    <QueueCollapse
      badge={
        <span className="badge badge-neutral text-xs font-semibold">{queueLength}</span>
      }
      className={className}
      onOpenChange={onOpenChange}
      open={open}
      title="История очереди"
    >
      <div className="flex flex-col gap-2">
        TODO: История
      </div>
    </QueueCollapse>
  )
}

export default QueueHistoryList
