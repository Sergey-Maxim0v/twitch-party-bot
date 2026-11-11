import type { QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_CLEAR_MESSAGES } from '../../../constants/queue.constants.ts'

/**
 * Хендлер для полной очистки списка игроков в текущей активной очереди.
 */
export const handleClearActiveQueue = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: QueueHandlerArgs): void => {
  setState(prev => ({
    ...prev,
    activeQueue: [],
  }))

  pushLog({
    message: QUEUE_CLEAR_MESSAGES.ACTIVE,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
