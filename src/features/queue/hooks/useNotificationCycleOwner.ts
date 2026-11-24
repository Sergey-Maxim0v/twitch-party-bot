import { useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'

type NotificationCycleOwnerArgs = Pick<QueueContextValue, 'isQueueOpen'> & {
  /** Канал, к которому привязана открытая очередь. */
  queueChannel: string | null;
}

/**
 * Единственный владелец цикла уведомлений: таймер работает всегда,
 * кроме случая, когда открытая очередь привязана к другому каналу.
 */
export const useNotificationCycleOwner = ({ isQueueOpen, queueChannel }: NotificationCycleOwnerArgs): void => {
  const { activeChannel } = useAuth()
  const { startNotificationCycle, stopNotificationCycle } = useQueueNotification()

  useEffect(() => {
    if (isQueueOpen && queueChannel !== activeChannel) {
      stopNotificationCycle()
      return
    }

    startNotificationCycle()
  }, [activeChannel, isQueueOpen, queueChannel, startNotificationCycle, stopNotificationCycle])
}
