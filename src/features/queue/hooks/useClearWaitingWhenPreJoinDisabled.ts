import { useEffect } from 'react'
import { APP_LOG_FALLBACK_ACTOR } from '../../../constants/app-logs.constants.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'

interface UseClearWaitingWhenPreJoinDisabledArgs {
  /** Очищает список ожидающих. */
  clearWaitingQueue: QueueContextValue['clearWaitingQueue'];
  /** Чтение актуального состояния очереди. */
  getState: QueueContextValue['getState'];
}

/**
 * Очищает список ожидающих, пока запись в него отключена.
 *
 * @param args - Функции очистки и чтения состояния очереди.
 */
export const useClearWaitingWhenPreJoinDisabled = ({
  clearWaitingQueue,
  getState,
}: UseClearWaitingWhenPreJoinDisabledArgs): void => {
  const { settings } = useQueueSettings()
  const { session, userDisplayName } = useAuth()

  useEffect(() => {
    if (settings.allowPreJoin || getState().waitingQueue.length === 0) return

    clearWaitingQueue({
      source: APP_LOG_SOURCES.STREAMER_UI,
      actorUsername: userDisplayName ?? session?.login ?? APP_LOG_FALLBACK_ACTOR,
    })
  }, [settings.allowPreJoin, clearWaitingQueue, getState, session?.login, userDisplayName])
}
