import { type DragEndEvent } from '@dnd-kit/core'
import { QUEUE_TYPES, type MutableQueueType, type QueuePlayer } from '../types.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { findQueueEntry } from './findQueueEntry.ts'
import { getQueueByType } from './getQueueByType.ts'

/** Аргументы обработки события перетаскивания. */
interface HandleDragEndArgs {
  /** Событие завершения Drag-and-Drop. */
  event: DragEndEvent
  /** Игроки в активной очереди. */
  activeQueue: QueuePlayer[]
  /** Игроки в списке ожидающих. */
  waitingQueue: QueuePlayer[]
  /** Функция перемещения игрока. */
  movePlayer: QueueContextValue['movePlayer']
  /** Никнейм того, кто выполнил перемещение. */
  actorUsername: string
}

/**
 * Обрабатывает завершение Drag-and-Drop и делегирует перемещение игрока.
 */
export const handleDragEnd = ({
  event,
  activeQueue,
  waitingQueue,
  movePlayer,
  actorUsername,
}: HandleDragEndArgs): void => {
  const { active, over } = event
  if (!over) return

  const activeEntryId = active.id as string
  const overId = over.id as string
  if (activeEntryId === overId) return

  const sourceEntry = findQueueEntry(activeQueue, waitingQueue, activeEntryId)
  if (!sourceEntry) return

  const isContainerDrop = overId === QUEUE_TYPES.ACTIVE || overId === QUEUE_TYPES.WAITING
  let targetQueueType: MutableQueueType
  let targetEntryId: string | null = null

  if (isContainerDrop) {
    targetQueueType = overId
  } else {
    const targetEntry = findQueueEntry(activeQueue, waitingQueue, overId)
    if (!targetEntry) return

    targetQueueType = targetEntry.queueType
    targetEntryId = overId
  }

  const sourceQueue = getQueueByType(activeQueue, waitingQueue, sourceEntry.queueType)
  const targetQueue = getQueueByType(activeQueue, waitingQueue, targetQueueType)
  // Бросок на контейнер означает вставку в конец списка.
  const targetIndex = targetEntryId
    ? targetQueue.findIndex(player => player.queueEntryId === targetEntryId)
    : undefined
  if (targetIndex === -1) return

  const sourceIndex = sourceQueue.findIndex(player => player.queueEntryId === activeEntryId)
  const destinationIndex = targetIndex ?? sourceQueue.length - 1
  if (sourceEntry.queueType === targetQueueType && sourceIndex === destinationIndex) return

  movePlayer({
    queueEntryId: sourceEntry.player.queueEntryId,
    userId: sourceEntry.player.userId,
    username: sourceEntry.player.username,
    displayedUsername: sourceEntry.player.displayedUsername,
    sourceQueueType: sourceEntry.queueType,
    targetQueueType,
    targetIndex,
    source: APP_LOG_SOURCES.STREAMER_UI,
    actorUsername,
  })
}
