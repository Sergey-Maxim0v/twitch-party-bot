import type { QueueSettings } from '../../queue-settings/types.ts'

/**
 * Сформировать текстовое сообщение о закрытии очереди с прикреплением актуального состава участников
 */
export const formatQueueCloseMessage = ({
  queueStatusText,
  prefix,
}: {
  queueStatusText: string;
  prefix: QueueSettings['messagePrefix'];
}): string => {
  const baseMessage = prefix ? `${prefix} Очередь закрыта!` : 'Очередь закрыта!'

  return queueStatusText ? `${baseMessage} | ${queueStatusText}` : baseMessage
}
