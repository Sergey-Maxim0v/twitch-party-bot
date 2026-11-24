import { useCallback, useEffect, useRef } from 'react'
import type { PendingChatMessage, SendChatMessageOptions } from '../types.ts'
import {
  CHAT_SEND_FAIL_REASONS,
  TWITCH_PENDING_MESSAGE_SWEEP_INTERVAL_MS,
  TWITCH_PENDING_MESSAGE_TTL_MS,
  TWITCH_PENDING_MESSAGES_MAX,
} from '../../../constants/twitch.constants.ts'
import { rejectPendingMessages } from '../utils/rejectPendingMessages.ts'

/**
 * Очередь сообщений, ожидающих подтверждения USERSTATE, и таймер снятия ограничений чата.
 *
 * Очередь ограничена по размеру и по времени ожидания: сообщение, для которого
 * подтверждение не пришло за отведённый срок, считается недоставленным.
 *
 * Таймеры не покидают хук, поэтому гасятся при размонтировании.
 */
export const useTwitchPendingMessages = () => {
  const pendingMessagesRef = useRef<PendingChatMessage[]>([])
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sweepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Сбрасывает таймер снятия ограничений чата.
   */
  const clearChatTimeout = useCallback((): void => {
    if (!timeoutTimerRef.current) return

    clearTimeout(timeoutTimerRef.current)
    timeoutTimerRef.current = null
  }, [])

  /**
   * Взводит таймер снятия ограничений чата, заменяя ранее запущенный.
   *
   * @param durationMs - Длительность таймера в миллисекундах.
   * @param onExpire - Действие, выполняемое при истечении таймера.
   */
  const startChatTimeout = useCallback((durationMs: number, onExpire: () => void): void => {
    clearChatTimeout()

    timeoutTimerRef.current = setTimeout(() => {
      timeoutTimerRef.current = null
      onExpire()
    }, durationMs)
  }, [clearChatTimeout])

  /**
   * Останавливает проверку сообщений, ожидающих подтверждения.
   */
  const stopSweepTimer = useCallback((): void => {
    if (!sweepTimerRef.current) return

    clearInterval(sweepTimerRef.current)
    sweepTimerRef.current = null
  }, [])

  /**
   * Снимает сообщения, для которых подтверждение не пришло в срок.
   */
  const sweepExpiredMessages = useCallback((): void => {
    const pendingMessages = pendingMessagesRef.current
    const now = Date.now()

    while (pendingMessages.length > 0 && now - pendingMessages[0].createdAt >= TWITCH_PENDING_MESSAGE_TTL_MS) {
      pendingMessages.shift()?.onFailed?.(CHAT_SEND_FAIL_REASONS.NO_CONFIRMATION)
    }

    if (pendingMessages.length > 0) return

    stopSweepTimer()
  }, [stopSweepTimer])

  /**
   * Запускает проверку сообщений, ожидающих подтверждения.
   */
  const startSweepTimer = useCallback((): void => {
    if (sweepTimerRef.current) return

    sweepTimerRef.current = setInterval(sweepExpiredMessages, TWITCH_PENDING_MESSAGE_SWEEP_INTERVAL_MS)
  }, [sweepExpiredMessages])

  /**
   * Добавляет сообщение в очередь подтверждения.
   *
   * При переполнении очереди самая старая запись снимается как недоставленная.
   */
  const registerPendingMessage = useCallback((text: string, options?: SendChatMessageOptions): void => {
    const pendingMessages = pendingMessagesRef.current

    pendingMessages.push({ ...options, text, createdAt: Date.now() })

    if (pendingMessages.length > TWITCH_PENDING_MESSAGES_MAX) {
      pendingMessages.shift()?.onFailed?.(CHAT_SEND_FAIL_REASONS.QUEUE_OVERFLOW)
    }

    startSweepTimer()
  }, [startSweepTimer])

  /**
   * Снимает всю очередь подтверждения, сообщая о недоставке.
   *
   * @param reason - Причина недоставки.
   */
  const clearPendingMessages = useCallback((reason: string): void => {
    rejectPendingMessages(pendingMessagesRef, reason, true)
    stopSweepTimer()
  }, [stopSweepTimer])

  // Таймеры не должны пережить размонтирование компонента
  useEffect(() => () => {
    clearChatTimeout()
    stopSweepTimer()
  }, [clearChatTimeout, stopSweepTimer])

  return {
    pendingMessagesRef,
    clearChatTimeout,
    startChatTimeout,
    registerPendingMessage,
    clearPendingMessages,
  }
}
