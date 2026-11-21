import type { QueueActionLog, QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_CLEAR_MESSAGES } from '../../../constants/queue.constants.ts'

/**
 * Полностью очищает список игроков в текущей активной очереди.
 *
 * @returns Данные для журнала приложения.
 */
export const handleClearActiveQueue = ({
  setState,
  source,
  actorUsername,
  pushLog,
  silent = false,
}: QueueHandlerArgs): QueueActionLog => {
  setState(prev => ({
    ...prev,
    activeQueue: [],
  }))

  const result: QueueActionLog = {
    message: QUEUE_CLEAR_MESSAGES.ACTIVE,
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
