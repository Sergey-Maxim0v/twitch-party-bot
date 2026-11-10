import { type FC, useCallback } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'

interface QueueControlsProps {
  /** Дополнительные CSS-классы контейнера. */
  className?: string;
}

/**
 * Кнопки открытия и закрытия очереди, а также завершения текущей сессии.
 */
export const QueueControls: FC<QueueControlsProps> = ({ className = '' }) => {
  const { isQueueOpen, openQueue, closeQueue, finishActiveQueue } = useQueue()
  const { session, userDisplayName } = useAuth()

  const handleFinishActiveQueue = useCallback(() => {
    finishActiveQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername: userDisplayName ?? session?.login ?? '' })
  }, [finishActiveQueue, session?.login, userDisplayName])

  const handleQueueToggle = useCallback(() => {
    if(isQueueOpen) {
      closeQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername: userDisplayName ?? session?.login ?? '' } )
    } else {
      openQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername: userDisplayName ?? session?.login ?? '' })
    }
  }, [isQueueOpen, closeQueue, userDisplayName, session?.login, openQueue])

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
