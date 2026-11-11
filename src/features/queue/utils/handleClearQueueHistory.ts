import type { QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'

/**
 * Хендлер для полной очистки истории сыгранных сессий (составов).
 * Обнуляет историю, счетчик сессий и все кулдауны/лимиты игроков.
 */
export const handleClearQueueHistory = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: QueueHandlerArgs): void => {
  setState(prev => ({
    ...prev,
    queueHistory: [],
    globalSessionCounter: 0,
    playerHistory: {},
  }))

  pushLog({
    message: 'История сыгранных сессий очищена.',
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
