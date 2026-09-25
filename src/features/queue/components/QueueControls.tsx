import { type FC, useCallback } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'

export interface QueueControlsProps {
  className?: string;
}

const QueueControls: FC<QueueControlsProps> = ({ className = '' }) => {
  const { isQueueOpen, openQueue, closeQueue, finishActiveQueue } = useQueue()
  const { session } = useAuth()

  const handleFinishActiveQueue = useCallback(() => {
    finishActiveQueue({ source: LOG_SOURCE.STREAMER_UI, actorUsername: session?.login ?? '' })
  }, [finishActiveQueue, session?.login])

  const handleQueueToggle = useCallback(() => {
    if(isQueueOpen) {
      closeQueue({ source: LOG_SOURCE.STREAMER_UI, actorUsername: session?.login ?? '' } )
    } else {
      openQueue({ source: LOG_SOURCE.STREAMER_UI, actorUsername: session?.login ?? '' })
    }
  }, [isQueueOpen, openQueue, session?.login, closeQueue])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        className={`btn btn-block btn-sm shadow-sm font-semibold truncate ${
          isQueueOpen ? 'btn-error btn-outline' : 'btn-primary'
        }`}
        onClick={handleQueueToggle}
        type="button"
      >
        {isQueueOpen ? 'Закрыть очередь' : 'Открыть очередь'}
      </button>

      <button
        className="btn btn-block btn-primary btn-outline btn-sm shadow-sm font-semibold truncate"
        onClick={handleFinishActiveQueue}
        type="button"
      >
        Завершить текущую очередь
      </button>
    </div>
  )
}

export default QueueControls
