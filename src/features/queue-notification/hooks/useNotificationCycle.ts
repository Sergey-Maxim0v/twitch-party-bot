import { type RefObject, useCallback, useEffect, useRef } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'

interface UseNotificationCycleParams {
  /** Задержка между отправками, сек. */
  botMessageCooldown: number
  /** Отправляет текст; `true` — буфер можно очистить. */
  sendMessage: (text: string) => boolean
  /** Буфер уведомлений. */
  stateRef: RefObject<TwitchNotificationState>
  /** Очищает буфер после успешной отправки. */
  clearBuffer: () => void
}

interface UseNotificationCycleReturn {
  startNotificationCycle: () => void
  stopNotificationCycle: () => void
}

/**
 * Цикл отправки накопленных уведомлений в чат Twitch.
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

  const tickRef = useRef<() => void>(() => {})

  const scheduleNextTick = useCallback((): void => {
    const intervalMs = cooldownRef.current * 1000
    timerRef.current = setTimeout(() => tickRef.current(), intervalMs)
  }, [])

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

      const currentState = currentRawStateRef.current
      const messageText = currentState
        ? formatNotificationMessage({
          state: currentState,
          permissions: currentPermissions,
          prefix: settings.messagePrefix,
        })
        : ''

      if (messageText.length > 0) {
        const isConsumed = currentSendFn(messageText)

        if (isConsumed) {
          currentClearFn()
        }
      }

      scheduleNextTick()
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
    scheduleNextTick()
  }, [scheduleNextTick])

  useEffect(() => stopNotificationCycle, [stopNotificationCycle])

  return {
    startNotificationCycle,
    stopNotificationCycle,
  }
}
