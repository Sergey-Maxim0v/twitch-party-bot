import type { QueueActionLog, QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_CLEAR_MESSAGES } from '../../../constants/queue.constants.ts'

/**
 * Полностью очищает список ожидающих.
 *
 * @returns Данные для журнала приложения.
 */
export const handleClearWaitingQueue = ({
  getState,
  setState,
  source,
  actorUsername,
  pushLog,
  silent = false,
}: QueueHandlerArgs): QueueActionLog => {
  const waitingCount = getState().waitingQueue.length

  setState(prev => ({
    ...prev,
    waitingQueue: [],
  }))

  const result: QueueActionLog = {
    message: QUEUE_CLEAR_MESSAGES.WAITING + (waitingCount ? ` Удалено ${waitingCount} игроков.` : ''),
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  if (!silent) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
