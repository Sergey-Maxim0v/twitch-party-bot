import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_CHAT_NOTIFICATION_MESSAGES } from '../../../constants/queue.constants.ts'

interface FormatQueueCloseMessageArgs {
  /** Текущий статус очереди. */
  queueStatusText: string;
  /** Префикс автоматических сообщений. */
  prefix: QueueSettings['messagePrefix'];
}

/**
 * Формирует сообщение о закрытии очереди с актуальным составом участников.
 */
export const formatQueueCloseMessage = ({
  queueStatusText,
  prefix,
}: FormatQueueCloseMessageArgs): string => {
  const baseMessage = prefix
    ? `${prefix} ${QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_CLOSED}`
    : QUEUE_CHAT_NOTIFICATION_MESSAGES.QUEUE_CLOSED

  return queueStatusText ? `${baseMessage} | ${queueStatusText}` : baseMessage
}
