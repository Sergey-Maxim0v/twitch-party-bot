import type { FC } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import QueueCollapse from '../../../components/QueueCollapse.tsx'
import QueueElement from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'

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
      <div className="flex flex-col gap-3">
        {queueHistory.map(session => {
          const formattedTime = session.playedAt
            ? new Date(session.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--'

          return (
            <div
              className="card card-compact bg-base-100/50 border border-base-content/10 shadow-xs p-3 rounded-xl"
              key={session.id}
            >
              <div className="flex items-center justify-between border-b border-base-content/5 pb-2 mb-2">
                <span className="text-sm font-bold text-base-content">{session.name}</span>
                <span className="text-xs text-base-content/60 font-medium">Время: {formattedTime}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {session.players.length ? (
                  session.players.map(player => (
                    <QueueElement
                      key={`${player.userId}-${player.timestamp}`}
                      player={player}
                      queueType={QUEUE_TYPES.HISTORY}
                    />
                  ))
                ) : (
                  <p className="text-xs text-base-content/40 italic pl-1 py-1">Нет участников в составе</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </QueueCollapse>
  )
}

export default QueueHistoryList
