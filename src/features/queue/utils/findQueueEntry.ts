import { QUEUE_TYPES, type QueueEntry, type QueuePlayer } from '../types.ts'

/**
 * Находит запись очереди по её уникальному идентификатору.
 *
 * @param activeQueue - Активная очередь.
 * @param waitingQueue - Список ожидающих.
 * @param queueEntryId - Уникальный идентификатор записи.
 * @returns Запись и список, в котором она находится, либо `null`.
 */
export const findQueueEntry = (
  activeQueue: QueuePlayer[],
  waitingQueue: QueuePlayer[],
  queueEntryId: string,
): QueueEntry | null => {
  const activePlayer = activeQueue.find(player => player.queueEntryId === queueEntryId)
  if (activePlayer) return { player: activePlayer, queueType: QUEUE_TYPES.ACTIVE }

  const waitingPlayer = waitingQueue.find(player => player.queueEntryId === queueEntryId)
  if (waitingPlayer) return { player: waitingPlayer, queueType: QUEUE_TYPES.WAITING }

  return null
}
