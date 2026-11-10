import type { QueueSettings } from '../../queue-settings/types.ts'

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
  const baseMessage = prefix ? `${prefix} Очередь закрыта!` : 'Очередь закрыта!'

  return queueStatusText ? `${baseMessage} | ${queueStatusText}` : baseMessage
}
