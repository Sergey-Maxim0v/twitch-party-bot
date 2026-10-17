import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleClearActiveQueue } from '../utils/handleClearActiveQueue.ts'
import { handleClearWaitingQueue } from '../utils/handleClearWaitingQueue.ts'
import { handleClearQueueHistory } from '../utils/handleClearQueueHistory.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

interface UseQueueClearArgs {
  setState: Dispatch<SetStateAction<QueueState>>;
  pushLog: AppLogsContextValue['pushLog'];
}

export const useQueueClear = ({ setState, pushLog }: UseQueueClearArgs) => {
  const { sendClearActive, sendClearWaiting } = useQueueNotification()

  const clearActiveQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearActiveQueue({ ...args, setState, pushLog })
    sendClearActive()
  }, [setState, pushLog, sendClearActive])

  const clearWaitingQueue = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearWaitingQueue({ ...args, setState, pushLog })
    sendClearWaiting()
  }, [setState, pushLog, sendClearWaiting])

  const clearQueueHistory = useCallback((args: {
    source: LogSource;
    actorUsername: string;
  }) => {
    handleClearQueueHistory({ ...args, setState, pushLog })
  }, [setState, pushLog])

  return { clearActiveQueue, clearWaitingQueue, clearQueueHistory }
}
