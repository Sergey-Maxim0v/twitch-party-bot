import { useCallback, useEffect, useRef } from 'react'
import type { PendingChatMessage, SendChatMessageOptions } from '../types.ts'

/**
 * Очередь сообщений, ожидающих подтверждения USERSTATE, и таймер снятия ограничений чата.
 *
 * Таймер не покидает хук: его создание и сброс доступны только через
 * `startChatTimeout` и `clearChatTimeout`, поэтому таймер гасится при размонтировании.
 */
export const useTwitchPendingMessages = () => {
  const pendingMessagesRef = useRef<PendingChatMessage[]>([])
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Сбрасывает таймер снятия ограничений чата.
   *
   * @returns `true`, если таймер был активен и сброшен.
   */
  const clearChatTimeout = useCallback((): boolean => {
    if (!timeoutTimerRef.current) return false

    clearTimeout(timeoutTimerRef.current)
    timeoutTimerRef.current = null

    return true
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

  // Таймер не должен пережить размонтирование компонента
  useEffect(() => {
    return () => {
      clearChatTimeout()
    }
  }, [clearChatTimeout])

  /**
   * Добавляет сообщение в очередь подтверждения.
   */
  const registerPendingMessage = useCallback((text: string, options?: SendChatMessageOptions): void => {
    pendingMessagesRef.current.push({ text, ...options })
  }, [])

  return {
    pendingMessagesRef,
    clearChatTimeout,
    startChatTimeout,
    registerPendingMessage,
  }
}
