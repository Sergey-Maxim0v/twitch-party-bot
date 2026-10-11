/**
 * Сформировать текстовое сообщение о закрытии очереди с прикреплением актуального состава участников
 */
export const formatQueueCloseMessage = (queueStatusText: string): string => {
  const prefix = 'Очередь закрыта! '

  return queueStatusText ? `${prefix} | ${queueStatusText}` : prefix
}
