import type { RefObject } from 'react'
import type { PendingChatMessage } from '../types.ts'

/**
 * Снимает сообщения из очереди ожидания и сообщает о недоставке.
 *
 * @param pendingMessagesRef - Очередь сообщений, ожидающих подтверждения.
 * @param reason - Причина недоставки.
 * @param rejectAll - Снять всю очередь или только первое сообщение.
 */
export const rejectPendingMessages = (
  pendingMessagesRef: RefObject<PendingChatMessage[]>,
  reason: string,
  rejectAll: boolean,
): void => {
  const pendingMessages = pendingMessagesRef.current

  if (pendingMessages.length === 0) return

  const rejectedMessages = rejectAll
    ? pendingMessages.splice(0, pendingMessages.length)
    : pendingMessages.splice(0, 1)

  rejectedMessages.forEach(pendingMessage => pendingMessage.onFailed?.(reason))
}
