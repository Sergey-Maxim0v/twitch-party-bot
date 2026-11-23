import { QUEUE_TYPES, type MutableQueueType, type QueuePlayer } from '../types'

/**
 * Возвращает список игроков для указанного типа очереди.
 *
 * @returns Активная очередь или список ожидающих.
 */
export const getQueueByType = (
  activeQueue: QueuePlayer[],
  waitingQueue: QueuePlayer[],
  queueType: MutableQueueType,
): QueuePlayer[] => queueType === QUEUE_TYPES.ACTIVE ? activeQueue : waitingQueue
