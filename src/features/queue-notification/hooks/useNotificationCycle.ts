import { type RefObject, useCallback, useEffect, useRef } from 'react'
import type { TwitchNotificationState } from '../types.ts'

interface UseNotificationCycleParams {
  botMessageCooldown: number
  sendMessage: (text: string) => void
  stateRef: RefObject<TwitchNotificationState>
  clearBuffer: () => void
  formatNotificationMessage: (state: TwitchNotificationState) => string
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
  formatNotificationMessage,
}: UseNotificationCycleParams): UseNotificationCycleReturn => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isCycleActiveRef = useRef<boolean>(false)
  const cooldownRef = useRef<number>(botMessageCooldown)

  const callbacksRef = useRef({
    sendMessage,
    clearBuffer,
    stateRef,
    formatNotificationMessage,
  })

  useEffect(() => {
    cooldownRef.current = botMessageCooldown
    callbacksRef.current = {
      sendMessage,
      clearBuffer,
      stateRef,
      formatNotificationMessage,
    }
  }, [botMessageCooldown, sendMessage, clearBuffer, stateRef, formatNotificationMessage])

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

    const tick = (): void => {
      if (!isCycleActiveRef.current) return

      const {
        stateRef: currentRawStateRef,
        formatNotificationMessage: currentFormatFn,
        sendMessage: currentSendFn,
        clearBuffer: currentClearFn,
      } = callbacksRef.current

      if (currentRawStateRef.current) {
        const messageText = currentFormatFn(currentRawStateRef.current)

        if (messageText.length > 0) {
          currentSendFn(messageText)
          currentClearFn()
        }
      }

      const intervalMs = cooldownRef.current * 1000
      timerRef.current = setTimeout(tick, intervalMs)
    }

    const intervalMs = cooldownRef.current * 1000
    timerRef.current = setTimeout(tick, intervalMs)
  }, [])

  // Автоматический сброс таймера при размонтировании компонента
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
