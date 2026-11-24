import { type FC, useCallback } from 'react'
import { LuFlag, LuPower } from 'react-icons/lu'
import { useQueue } from '../hooks/useQueue.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_COMMAND_LABELS } from '../../../constants/queue.constants.ts'
import type { ClassNameProps } from '../../../types/common.types.ts'

/**
 * Кнопки открытия и закрытия очереди, а также завершения текущей сессии.
 */
export const QueueControls: FC<ClassNameProps> = ({ className = '' }) => {
  const { isQueueOpen, openQueue, closeQueue, finishActiveQueue } = useQueue()
  const actorUsername = useActorUsername('')

  const handleFinishActiveQueue = useCallback(() => {
    finishActiveQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername })
  }, [finishActiveQueue, actorUsername])

  const handleQueueToggle = useCallback(() => {
    if(isQueueOpen) {
      closeQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername })
    } else {
      openQueue({ source: APP_LOG_SOURCES.STREAMER_UI, actorUsername })
    }
  }, [isQueueOpen, closeQueue, actorUsername, openQueue])

  const toggleButtonClass = isQueueOpen
    ? 'border-error/30 bg-error/10 text-error shadow-none hover:border-error/60 hover:bg-error/15'
    : 'border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-content shadow-primary/20 hover:brightness-105 hover:shadow-md'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        className={`btn btn-block btn-sm h-10 min-h-10 justify-start gap-2 rounded-xl border px-3
          font-semibold shadow-sm transition-all duration-200 active:scale-[0.99] ${toggleButtonClass}`}
        onClick={handleQueueToggle}
        type="button"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg
            ${isQueueOpen ? 'bg-error/15' : 'bg-primary-content/15'}`}
        >
          <LuPower className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{isQueueOpen ? QUEUE_COMMAND_LABELS.stop : QUEUE_COMMAND_LABELS.start}</span>
        <span
          className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full
            ${isQueueOpen ? 'animate-pulse bg-error' : 'bg-primary-content/80'}`}
        />
      </button>

      <button
        className="btn btn-block btn-sm h-10 min-h-10 justify-start gap-2 rounded-xl border border-base-300/70
          bg-base-100/50 px-3 font-semibold text-base-content/70 shadow-none transition-all duration-200
          hover:border-primary/30 hover:bg-primary/10 hover:text-primary active:scale-[0.99]"
        onClick={handleFinishActiveQueue}
        type="button"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LuFlag className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{QUEUE_COMMAND_LABELS.play}</span>
      </button>
    </div>
  )
}
