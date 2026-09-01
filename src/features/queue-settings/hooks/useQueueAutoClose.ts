import { type RefObject, useEffect, useRef } from 'react'
import { useAuth } from '../../auth/hooks/useAuth.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { useQueueSettings } from './useQueueSettings.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'

/**
 * Хук для автоматического закрытия очереди при разлогине, смене канала, перезагрузке страницы.
 */
export const useQueueAutoClose = () => {
  const { activeChannel } = useAuth()
  const { pushLog } = useAppLogs()
  const { settings, updateSettings } = useQueueSettings()

  const isClosingRef: RefObject<boolean> = useRef(false)

  useEffect(() => {
    if (!settings.isQueueOpen || isClosingRef.current) return

    isClosingRef.current = true

    updateSettings({ isQueueOpen: false })

    pushLog({
      message: 'Очередь закрыта',
      source: LOG_SOURCE.APPLICATION,
      actorUsername: 'Application',
    })
        
    // eslint-disable-next-line
    }, [activeChannel]);
}
