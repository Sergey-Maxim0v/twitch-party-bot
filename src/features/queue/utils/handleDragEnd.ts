import { type DragEndEvent } from '@dnd-kit/core'
import { QUEUE_TYPES, type QueueType } from '../types.ts'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'

/** Аргументы обработки события перетаскивания. */
interface HandleDragEndArgs {
  /** Событие завершения Drag-and-Drop. */
  event: DragEndEvent
  /** Игроки в активной очереди. */
  activeQueue: QueueContextValue['activeQueue']
  /** Игроки в списке ожидающих. */
  waitingQueue: QueueContextValue['waitingQueue']
  /** Функция перемещения игрока. */
  movePlayer: QueueContextValue['movePlayer']
  /** Никнейм того, кто выполнил перемещение. */
  actorUsername: string
  /** Логин перемещаемого игрока. */
  username: string
}

/**
 * Обрабатывает завершение Drag-and-Drop и делегирует перемещение игрока.
 */
export const handleDragEnd = ({ event, activeQueue, waitingQueue, movePlayer, actorUsername, username }: HandleDragEndArgs): void => {
  const { active, over } = event
  if (!over) return

  const activeId = active.id as string
  const overId = over.id as string

  if (activeId === overId) return

  const isInActive = activeQueue.some(p => p.userId === activeId)
  const sourceQueue = isInActive ? QUEUE_TYPES.ACTIVE : QUEUE_TYPES.WAITING

  let targetQueueType: Exclude<QueueType, 'history'>
  let targetIndex: number | undefined

  if (overId === QUEUE_TYPES.ACTIVE) {
    targetQueueType = QUEUE_TYPES.ACTIVE
    targetIndex = activeQueue.length
  } else if (overId === QUEUE_TYPES.WAITING) {
    targetQueueType = QUEUE_TYPES.WAITING
    targetIndex = waitingQueue.length
  } else {
    const isOverActive = activeQueue.some(p => p.userId === overId)
    targetQueueType = isOverActive ? QUEUE_TYPES.ACTIVE : QUEUE_TYPES.WAITING

    const targetList = isOverActive ? activeQueue : waitingQueue
    const index = targetList.findIndex(p => p.userId === overId)
    targetIndex = index !== -1 ? index : undefined
  }

  if (sourceQueue === targetQueueType && targetIndex !== undefined) {
    const sourceList = sourceQueue === QUEUE_TYPES.ACTIVE ? activeQueue : waitingQueue
    const currentIndex = sourceList.findIndex(p => p.userId === activeId)
    if (currentIndex === targetIndex) return
  }

  movePlayer({
    userId: activeId,
    username: username,
    targetQueueType,
    targetIndex,
    source: APP_LOG_SOURCES.STREAMER_UI,
    actorUsername,
  })
}
