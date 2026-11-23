import type { QueueState } from '../types'

/**
 * Проверяет, что порядок игроков в обеих очередях не изменился.
 *
 * @returns `true`, если состав и порядок списков совпадают.
 */
export const hasSameQueueOrder = (prev: QueueState, next: QueueState): boolean => {
  if (prev.activeQueue.length !== next.activeQueue.length) return false
  if (prev.waitingQueue.length !== next.waitingQueue.length) return false

  return prev.activeQueue.every((player, index) =>
    player.queueEntryId === next.activeQueue[index].queueEntryId)
    && prev.waitingQueue.every((player, index) =>
      player.queueEntryId === next.waitingQueue[index].queueEntryId)
}
