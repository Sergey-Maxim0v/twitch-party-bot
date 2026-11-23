import { useCallback } from 'react'
import type { QueueActionLog, QueueActorContext, QueueClearArgs, QueueSetState, QueueState } from '../types'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import {
  handleClearActiveQueue,
  handleClearQueueHistory,
  handleClearWaitingQueue,
} from '../utils/queueSessionHandlers.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

interface UseQueueClearArgs {
  setState: QueueSetState;
  getState: () => QueueState;
  pushLog: AppLogsContextValue['pushLog'];
}

export const useQueueClear = ({ setState, getState, pushLog }: UseQueueClearArgs) => {
  const { sendClearActive, sendClearWaiting } = useQueueNotification()

  const clearActiveQueue = useCallback((args: QueueClearArgs): QueueActionLog => {
    const { notify = true, ...handlerArgs } = args
    const result = handleClearActiveQueue({ ...handlerArgs, getState, setState, pushLog })
    sendClearActive(notify)

    return result
  }, [getState, setState, pushLog, sendClearActive])

  const clearWaitingQueue = useCallback((args: QueueClearArgs): QueueActionLog => {
    const { notify = true, ...handlerArgs } = args
    const result = handleClearWaitingQueue({ ...handlerArgs, getState, setState, pushLog })
    sendClearWaiting(notify)

    return result
  }, [getState, setState, pushLog, sendClearWaiting])

  const clearQueueHistory = useCallback((args: QueueActorContext): void => {
    handleClearQueueHistory({ ...args, getState, setState, pushLog })
  }, [getState, setState, pushLog])

  return { clearActiveQueue, clearWaitingQueue, clearQueueHistory }
}
