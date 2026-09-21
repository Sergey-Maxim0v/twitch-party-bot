import { type DragEndEvent } from '@dnd-kit/core'
import { QUEUE_TYPES } from '../types.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import type { TwitchAuthHookResult } from '../../auth/types'
import type { QueueContextValue } from '../context/QueueInstance.ts'

export interface HandleDragEndArgs {
  event: DragEndEvent
  activeQueue: QueueContextValue['activeQueue']
  futureQueue: QueueContextValue['futureQueue']
  movePlayer: QueueContextValue['movePlayer']
  userDisplayName: TwitchAuthHookResult['userDisplayName']
}

export const handleDragEnd = ({ event, activeQueue, futureQueue, movePlayer, userDisplayName }: HandleDragEndArgs): void => {
  const { active, over } = event
  if (!over) return

  const activeId = active.id as string
  const overId = over.id as string

  // Если бросили на тот же элемент, ничего не делаем
  if (activeId === overId) return

  // Определяем, в какой очереди изначально находился элемент
  const isInActive = activeQueue.some(p => p.userId === activeId)
  const sourceQueue = isInActive ? QUEUE_TYPES.ACTIVE : QUEUE_TYPES.FUTURE

  let targetQueueType: 'active' | 'future'
  let targetIndex: number | undefined

  // Проверяем, закинули ли элемент напрямую на контейнер очереди
  if (overId === QUEUE_TYPES.ACTIVE) {
    targetQueueType = 'active'
    targetIndex = activeQueue.length // В конец списка
  } else if (overId === QUEUE_TYPES.FUTURE) {
    targetQueueType = 'future'
    targetIndex = futureQueue.length // В конец списка
  } else {
    // Иначе элемент закинули поверх другого игрока
    const isOverActive = activeQueue.some(p => p.userId === overId)
    targetQueueType = isOverActive ? 'active' : 'future'

    const targetList = isOverActive ? activeQueue : futureQueue
    const index = targetList.findIndex(p => p.userId === overId)
    targetIndex = index !== -1 ? index : undefined
  }

  // Если тип очереди и индекс не изменились (перенос на самого себя внутри контейнера без смены позиции)
  if (sourceQueue === targetQueueType && targetIndex !== undefined) {
    const sourceList = sourceQueue === QUEUE_TYPES.ACTIVE ? activeQueue : futureQueue
    const currentIndex = sourceList.findIndex(p => p.userId === activeId)
    if (currentIndex === targetIndex) return
  }

  // Вызываем существующий метод перемещения из QueueProvider
  movePlayer({
    userId: activeId,
    targetQueueType,
    targetIndex,
    source: LOG_SOURCE.STREAMER_UI,
    actorUsername: userDisplayName ?? 'Application',
  })
}
