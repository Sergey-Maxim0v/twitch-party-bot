import type { FC } from 'react'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'

export interface QueueClearSectionProps {
  titleClassName?: string;
  className?: string;
}

const QueueClearSection: FC<QueueClearSectionProps> = ({ className = '', titleClassName = '' }) => {
  const { clearActiveQueue, clearQueueHistory, clearFutureQueue } = useQueue()
  const { session } = useAuth()

  const argsClearFnc = {
    source: LOG_SOURCE.STREAMER_UI,
    actorUsername: session?.login ?? '',
    actorRole: session?.login ?? 'Application',
  }

  return (
    <div
      className={`w-full min-w-0 space-y-3 p-3 rounded-xl bg-base-200/50 border border-base-300/60 ${className}`}
    >
      <h3 className={titleClassName}>Очистить очередь</h3>

      <div className="form-control w-full flex flex-col gap-2">
        <button
          className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
          onClick={() => { clearActiveQueue(argsClearFnc) }}
          type="button"
        >
          Очистить текущую очередь
        </button>
        <button
          className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
          onClick={() => { clearFutureQueue(argsClearFnc) }}
          type="button"
        >
          Очистить будущие очереди
        </button>
        <button
          className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
          onClick={() => { clearQueueHistory(argsClearFnc) }}
          type="button"
        >
          Очистить историю
        </button>
      </div>
    </div>
  )
}

export default QueueClearSection
