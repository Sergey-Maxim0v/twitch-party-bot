import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_CHAT_NOTIFICATION_MESSAGES } from '../../../constants/queue.constants.ts'

/**
 * Возвращает текст уведомления об очистке очередей с учётом разрешённых списков.
 * `null` — уведомление отправлять не нужно.
 */
export const resolveClearNotificationMessage = (
  permissions: QueueSettings['chatNotificationPermissions'],
): string | null => {
  if (permissions.onClearActive && permissions.onClearWaiting) {
    return QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ALL
  }

  if (permissions.onClearActive) {
    return QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_ACTIVE
  }

  if (permissions.onClearWaiting) {
    return QUEUE_CHAT_NOTIFICATION_MESSAGES.CLEARED_WAITING
  }

  return null
}
