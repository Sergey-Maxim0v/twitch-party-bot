import { useContext } from 'react'
import { QueueNotificationContext, type QueueNotificationContextType } from '../context/QueueNotificationInstance.ts'

/**
 * Хук для доступа к состоянию и методам автоматической отправки сообщений об изменениях в очереди в чат Twitch.
 */
export const useQueueNotification = (): QueueNotificationContextType => {
  const context = useContext(QueueNotificationContext)

  if (!context) {
    throw new Error('useQueueNotification must be used within a QueueNotificationProvider')
  }

  return context
}
