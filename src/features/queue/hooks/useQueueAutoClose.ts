import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES, APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_CLEAR_MESSAGES, QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import type { QueueNotificationContextType } from '../../queue-notification/context/QueueNotificationInstance.ts'
import type { QueueAutoCloseArgs, QueueStateAccess } from '../types.ts'
import { createInitialState } from '../utils/queueState.utils.ts'

type UseQueueAutoCloseProps = Pick<QueueStateAccess, 'setState' | 'pushLog'> & {
  /** Текущий статус активности очереди. */
  isQueueOpen: boolean;
  /** Канал, к которому привязана открытая очередь. */
  queueChannel: string | null;
  /** Сохраняет канал, к которому привязана очередь. */
  setQueueChannel: Dispatch<SetStateAction<string | null>>;
  /** Закрывает очередь при смене канала. */
  autoCloseQueue: (args: QueueAutoCloseArgs) => void;
  /** Очищает буфер накопленных уведомлений. */
  clearBuffer: QueueNotificationContextType['clearBuffer'];
}

/**
 * При смене активного канала очищает данные предыдущего канала и закрывает открытую очередь.
 * Первое подключение и перезагрузка страницы не считаются сменой канала.
 */
export const useQueueAutoClose = ({
  isQueueOpen,
  queueChannel,
  setQueueChannel,
  autoCloseQueue,
  setState,
  pushLog,
  clearBuffer,
}: UseQueueAutoCloseProps): void => {
  const { activeChannel } = useAuth()
  const actorUsername = useActorUsername()
  const previousChannelRef = useRef(activeChannel)

  useEffect(() => {
    const previousChannel = previousChannelRef.current
    previousChannelRef.current = activeChannel

    if (previousChannel !== null && previousChannel !== activeChannel) {
      setState(createInitialState())
      clearBuffer()

      pushLog({
        message: QUEUE_CLEAR_MESSAGES.CHANNEL_CHANGE,
        status: APP_LOG_STATUSES.WARNING,
        source: APP_LOG_SOURCES.APPLICATION,
        actorUsername,
      })
    }

    if (!isQueueOpen) return

    // Очередь, сохранённая до появления привязки к каналу, остаётся открытой на текущем канале.
    if (queueChannel === null) {
      setQueueChannel(activeChannel)
      return
    }

    if (!activeChannel || queueChannel === activeChannel) return

    autoCloseQueue({
      message: QUEUE_SESSION_LOG_MESSAGES.AUTO_CLOSED_ON_CHANNEL_CHANGE,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })
  }, [
    activeChannel,
    actorUsername,
    autoCloseQueue,
    clearBuffer,
    isQueueOpen,
    pushLog,
    queueChannel,
    setQueueChannel,
    setState,
  ])
}
