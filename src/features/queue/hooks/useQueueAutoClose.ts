import { type Dispatch, type SetStateAction, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import { QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'

interface UseQueueAutoCloseProps {
  /** Текущий статус активности очереди. */
  isQueueOpen: boolean;
  /** Канал, к которому привязана открытая очередь. */
  queueChannel: string | null;
  /** Сохраняет канал, к которому привязана очередь. */
  setQueueChannel: Dispatch<SetStateAction<string | null>>;
  /** Закрывает очередь при смене канала. */
  autoCloseQueue: (args: { source: LogSource; actorUsername: string; message: string }) => void;
}

/**
 * Автоматически закрывает очередь при смене активного Twitch-канала.
 * Очередь, открытая на текущем канале, сохраняется при перезагрузке страницы.
 */
export const useQueueAutoClose = ({
  isQueueOpen,
  queueChannel,
  setQueueChannel,
  autoCloseQueue,
}: UseQueueAutoCloseProps): void => {
  const { activeChannel } = useAuth()
  const actorUsername = useActorUsername()

  useEffect(() => {
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
  }, [activeChannel, actorUsername, autoCloseQueue, isQueueOpen, queueChannel, setQueueChannel])
}
