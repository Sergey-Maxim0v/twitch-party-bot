import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from '../../queue/hooks/useQueue.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'
import type { TwitchNotificationState } from '../types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { QueueNotificationContext, type QueueNotificationContextType } from './QueueNotificationInstance.ts'

const initialDefaultState: TwitchNotificationState = {
  joined: new Set<string>(),
  deleted: new Set<string>(),
  moved: new Set<string>(),
  denied: new Set<string>(),
}

export const QueueNotificationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TwitchNotificationState>(initialDefaultState)

  const { sendChatMessage } = useTwitchChat()
  const { settings } = useQueueSettings()
  const { activeQueue } = useQueue()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearMessage = useCallback((): void => {
    setState({
      joined: new Set<string>(),
      deleted: new Set<string>(),
      moved: new Set<string>(),
      denied: new Set<string>(),
    })
  }, [])

  const sendMessage = useCallback((_channel: string, text: string): void => {
    if (settings.chatNotificationPermissions.allowSending && text.trim().length > 0) {
      sendChatMessage(text)
    }
  }, [settings.chatNotificationPermissions.allowSending, sendChatMessage])

  const stopCycle = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startCycle = useCallback((): void => {
    stopCycle()

    const intervalMs = settings.botMessageCooldown * 1000

    timerRef.current = setInterval(() => {
      if (!settings.chatNotificationPermissions.allowSending) {
        return
      }

      setState(currentState => {
        const messageText = formatNotificationMessage(currentState)

        if (messageText.length > 0) {
          sendChatMessage(messageText)
          return {
            joined: new Set<string>(),
            deleted: new Set<string>(),
            moved: new Set<string>(),
            denied: new Set<string>(),
          }
        }

        return currentState
      })
    }, intervalMs)
  }, [settings.botMessageCooldown, settings.chatNotificationPermissions.allowSending, sendChatMessage, stopCycle])

  const sendCurrentQueueStatus = useCallback((): void => {
    if (!settings.chatNotificationPermissions.allowSending) {
      return
    }

    if (activeQueue.length === 0) {
      sendChatMessage('[Очередь] На данный момент очередь пуста.')
      return
    }

    const playerList = activeQueue.map(player => `@${player.username}`).join(', ')
    const statusText = `[Очередь] Текущий состав (${activeQueue.length}/${settings.maxQueueSize}): ${playerList}`

    if (statusText.length > 400) {
      sendChatMessage(`${statusText.slice(0, 395)}...`)
    } else {
      sendChatMessage(statusText)
    }
  }, [activeQueue, settings.chatNotificationPermissions.allowSending, settings.maxQueueSize, sendChatMessage])

  // Очистка интервала при размонтировании для предотвращения утечек памяти
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const contextValue = useMemo<QueueNotificationContextType>(() => ({
    state,
    setState,
    sendMessage,
    clearMessage,
    startCycle,
    stopCycle,
    sendCurrentQueueStatus,
  }), [state, sendMessage, clearMessage, startCycle, stopCycle, sendCurrentQueueStatus])

  return (
    <QueueNotificationContext.Provider value={contextValue}>
      {children}
    </QueueNotificationContext.Provider>
  )
}
