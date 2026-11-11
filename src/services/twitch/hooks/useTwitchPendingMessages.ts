import { useCallback, useEffect, useRef } from 'react'
import type { PendingChatMessage, SendChatMessageOptions } from '../types.ts'

/**
 * Очередь сообщений, ожидающих подтверждения USERSTATE,
 * и таймер ограничений чата.
 */
export const useTwitchPendingMessages = () => {
  const pendingMessagesRef = useRef<PendingChatMessage[]>([])
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = timeoutTimerRef.current

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
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
