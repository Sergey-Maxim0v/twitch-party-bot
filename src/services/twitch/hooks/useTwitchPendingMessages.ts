import { useCallback, useEffect, useRef } from 'react'
import { clearChatTimeout } from '../utils/clearChatTimeout.ts'
import type { PendingChatMessage, SendChatMessageOptions } from '../types.ts'

/**
 * Очередь сообщений, ожидающих подтверждения USERSTATE, и таймер снятия ограничений чата.
 */
export const useTwitchPendingMessages = () => {
  const pendingMessagesRef = useRef<PendingChatMessage[]>([])
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref читается в cleanup: на монтировании таймер ещё не создан, поэтому значение всегда null
  useEffect(() => {
    return () => {
      clearChatTimeout(timeoutTimerRef)
    }
  }, [])

  /**
   * Добавляет сообщение в очередь подтверждения.
   */
  const registerPendingMessage = useCallback((text: string, options?: SendChatMessageOptions): void => {
    pendingMessagesRef.current.push({ text, ...options })
  }, [])

  return {
    pendingMessagesRef,
    timeoutTimerRef,
    registerPendingMessage,
  }
}
