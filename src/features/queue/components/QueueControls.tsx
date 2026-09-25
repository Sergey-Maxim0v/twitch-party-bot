import { type FC, useCallback } from 'react'
import { useQueue } from '../hooks/useQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface QueueControlsProps {
  className?: string;
}

const QueueControls: FC<QueueControlsProps> = ({ className = '' }) => {
  const { isQueueOpen, setIsQueueOpen, finishActiveQueue } = useQueue()
  const { settings } = useQueueSettings()
  const { session } = useAuth()
  const { pushLog } = useAppLogs()

  const handleFinishActiveQueue = useCallback(() => {
    finishActiveQueue({ source: LOG_SOURCE.STREAMER_UI, actorUsername: session?.login ?? '' })

    if (!settings.allowPreJoin) {
      setIsQueueOpen(false)
    }
  }, [finishActiveQueue, session?.login, settings.allowPreJoin, setIsQueueOpen])

  const handleQueueToggle = useCallback(() => {
    const argsPushLogFnc: Parameters<AppLogsContextValue['pushLog']>[0] = {
      message: isQueueOpen ? 'Очередь закрыта' : 'Очередь открыта',
      source: LOG_SOURCE.STREAMER_UI,
      actorUsername: session?.login ?? '',
    }

    pushLog(argsPushLogFnc)
    setIsQueueOpen(!isQueueOpen )
  }, [isQueueOpen, session?.login, pushLog, setIsQueueOpen])

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
