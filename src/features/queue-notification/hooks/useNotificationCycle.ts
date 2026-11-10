import { type RefObject, useCallback, useEffect, useRef } from 'react'
import type { TwitchNotificationState } from '../types.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { formatNotificationMessage } from '../utils/formatNotificationMessage.ts'

interface UseNotificationCycleParams {
  /** Задержка между отправками накопленных уведомлений, в секундах. */
  botMessageCooldown: number
  /** Функция отправки сообщения в чат. */
  sendMessage: (text: string) => void
  /** Актуальное состояние буфера уведомлений. */
  stateRef: RefObject<TwitchNotificationState>
  /** Функция очистки буфера после отправки. */
  clearBuffer: () => void
}

interface UseNotificationCycleReturn {
  /** Запускает цикл отправки уведомлений. */
  startNotificationCycle: () => void
  /** Останавливает цикл отправки уведомлений. */
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
        currentSendFn(messageText)
        currentClearFn()
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
