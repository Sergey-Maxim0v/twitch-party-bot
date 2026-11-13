import type { RefObject } from 'react'

/**
 * Сбрасывает таймер снятия ограничений чата.
 *
 * @param timeoutTimerRef - Ref с идентификатором активного таймера.
 * @returns `true`, если таймер был активен и сброшен.
 */
export const clearChatTimeout = (
  timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>,
): boolean => {
  if (!timeoutTimerRef.current) return false

  clearTimeout(timeoutTimerRef.current)
  timeoutTimerRef.current = null

  return true
}
