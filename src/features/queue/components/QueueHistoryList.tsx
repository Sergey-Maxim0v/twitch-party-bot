import { type FC } from 'react'
import { LuClock } from 'react-icons/lu'
import { useQueue } from '../hooks/useQueue.ts'
import { QueueCollapse, type QueueListProps } from '../../../components/QueueCollapse.tsx'
import { QueueElement } from './QueueElement.tsx'
import { QUEUE_TYPES } from '../types.ts'
import { formatTime } from '../../../utils/dateTime.ts'

/**
 * История завершённых игровых сессий.
 */
export const QueueHistoryList: FC<QueueListProps> = ({ className = '', onOpenChange, open }) => {
  const { queueHistory } = useQueue()

  const queueLength = queueHistory?.length ?? 0

  return (
    <QueueCollapse
      badge={
        <span
          className="inline-flex h-5 min-w-6 items-center justify-center rounded-md border border-base-300/60
            bg-base-200/80 px-1.5 font-mono text-[10px] font-bold tabular-nums text-base-content/55"
        >
          {queueLength}
        </span>
      }
      className={`${className} rounded-xl! shadow-xs`}
      onOpenChange={onOpenChange}
      open={open}
      title="История"
    >
      <div className="flex flex-col gap-2.5">
        {queueHistory.map(session => {
          const formattedTime = session.playedAt
            ? formatTime(session.playedAt)
            : '--:--'

          return (
            <div
              className="overflow-hidden rounded-xl border border-base-300/60 bg-base-100/60 shadow-xs"
              key={session.id}
            >
              <div
                className="flex items-center justify-between gap-2 border-b border-base-300/50
                  bg-gradient-to-r from-base-200/60 to-transparent px-2.5 py-2"
              >
                <span className="truncate text-xs font-bold text-base-content/80">{session.name}</span>
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-md bg-base-200/70 px-1.5 py-0.5
                    font-mono text-[10px] font-medium tabular-nums text-base-content/50"
                >
                  <LuClock className="h-2.5 w-2.5" />
                  {formattedTime}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-2">
                {session.players.length ? (
                  session.players.map(player => (
                    <QueueElement
                      key={player.queueEntryId}
                      player={player}
                      queueType={QUEUE_TYPES.HISTORY}
                    />
                  ))
                ) : (
                  <p className="px-1 py-2 text-center text-[11px] italic text-base-content/35">
                    Нет участников в составе
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </QueueCollapse>
  )
}
