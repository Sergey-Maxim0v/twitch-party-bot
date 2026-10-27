import { type RefObject, useCallback, useEffect, useRef } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'

interface UseNotificationCycleParams {
  botMessageCooldown: number
  sendMessage: (text: string) => void
  stateRef: RefObject<TwitchNotificationState>
  clearBuffer: () => void
}

interface UseNotificationCycleReturn {
  startNotificationCycle: () => void
  stopNotificationCycle: () => void
}

/**
 * Хук для управления асинхронным циклом автоматической отправки накопленных уведомлений в чат Twitch.
 */
export const useNotificationCycle = ({
  botMessageCooldown,
  sendMessage,
  stateRef,
  clearBuffer,
}: UseNotificationCycleParams): UseNotificationCycleReturn => {
  const { settings } = useQueueSettings()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCycleActiveRef = useRef<boolean>(false)
  const cooldownRef = useRef<number>(botMessageCooldown)

  const callbacksRef = useRef({
    sendMessage,
    clearBuffer,
    stateRef,
    permissions: settings.chatNotificationPermissions,
  })

  // Реф для хранения актуальной функции tick для предотвращения замыкания старых ссылок
  const tickRef = useRef<() => void>(() => {})

  useEffect(() => {
    cooldownRef.current = botMessageCooldown
    callbacksRef.current = {
      sendMessage,
      clearBuffer,
      stateRef,
      permissions: settings.chatNotificationPermissions,
    }
  }, [botMessageCooldown, sendMessage, clearBuffer, stateRef, settings.chatNotificationPermissions])

  useEffect(() => {
    tickRef.current = (): void => {
      if (!isCycleActiveRef.current) return

      const {
        stateRef: currentRawStateRef,
        sendMessage: currentSendFn,
        clearBuffer: currentClearFn,
        permissions: currentPermissions,
      } = callbacksRef.current

      if (currentRawStateRef.current) {
        const messageText = formatNotificationMessage({
          state: currentRawStateRef.current,
          permissions: currentPermissions,
          prefix: settings.messagePrefix,
        })

        if (messageText.length > 0) {
          currentSendFn(messageText)
          currentClearFn()
        }
      }

      const intervalMs = cooldownRef.current * 1000
      timerRef.current = setTimeout(() => tickRef.current(), intervalMs)
    }
  })

  const stopNotificationCycle = useCallback((): void => {
    isCycleActiveRef.current = false
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startNotificationCycle = useCallback((): void => {
    if (isCycleActiveRef.current && timerRef.current) {
      return
    }

    isCycleActiveRef.current = true
    const intervalMs = cooldownRef.current * 1000
    timerRef.current = setTimeout(() => tickRef.current(), intervalMs)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    startNotificationCycle,
    stopNotificationCycle,
  }
}
