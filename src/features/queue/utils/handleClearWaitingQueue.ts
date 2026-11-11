import type { QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_CLEAR_MESSAGES } from '../../../constants/queue.constants.ts'

/**
 * Хендлер для полной очистки списка игроков в списке ожидающих.
 */
export const handleClearWaitingQueue = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: QueueHandlerArgs): void => {
  let waitingCount = 0

  setState(prev => {
    waitingCount = prev.waitingQueue.length

    return {
      ...prev,
      waitingQueue: [],
    }
  })

  const logMessage = QUEUE_CLEAR_MESSAGES.WAITING + (waitingCount ? ` Удалено ${waitingCount} игроков.` : '')

  pushLog({
    message: logMessage,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
