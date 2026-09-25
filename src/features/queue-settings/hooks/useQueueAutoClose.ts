import { type RefObject, useEffect, useRef } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import { useQueue } from '../../queue/hooks/useQueue.ts'

/**
 * Хук для автоматического закрытия очереди при разлогине, смене канала, перезагрузке страницы.
 */
export const useQueueAutoClose = () => {
  const { activeChannel } = useAuth()
  const { pushLog } = useAppLogs()
  const { isQueueOpen, setIsQueueOpen } = useQueue()

  const isClosingRef: RefObject<boolean> = useRef(false)

  useEffect(() => {
    if (!isQueueOpen || isClosingRef.current) return

    isClosingRef.current = true

    setIsQueueOpen(false )

    pushLog({
      message: 'Очередь закрыта',
      source: LOG_SOURCE.APPLICATION,
      actorUsername: 'Application',
    })
        
    // eslint-disable-next-line
    }, [activeChannel]);
}
