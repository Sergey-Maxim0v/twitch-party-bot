import { QUEUE_TYPES, type QueueHandlerArgs, type QueueType } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_TYPE_LABELS, QUEUE_TYPE_LABELS_ACCUSATIVE } from '../../../constants/queue.constants.ts'

interface HandleMovePlayerArgs extends QueueHandlerArgs {
  /** Уникальный ID пользователя на Twitch для перемещения */
  userId: string;
  /** Целевой тип очереди, куда перетаскивают игрока */
  targetQueueType: Exclude<QueueType, 'history'>;
  /** Индекс (позиция), куда нужно вставить игрока (если не передан — падает в конец) */
  targetIndex: number | undefined;
  /** Никнейм для отображения */
  displayedUsername?: string;
}

/**
 * Перемещает игрока внутри одной очереди или между ними (Drag-and-Drop).
 */
export const handleMovePlayer = ({
  userId,
  targetQueueType,
  targetIndex,
  displayedUsername,
  source,
  actorUsername,
  setState,
  pushLog,
}: HandleMovePlayerArgs): void => {
  let targetPlayerName = displayedUsername || ''
  let sourceQueueType: Exclude<QueueType, 'history'> | null = null
  let isMoved = false

  setState(prev => {
    const activeIdx = prev.activeQueue.findIndex(p => p.userId === userId)
    const waitingIdx = prev.waitingQueue.findIndex(p => p.userId === userId)

    let playerToMove = null
    const updatedActive = [...prev.activeQueue]
    const updatedWaiting = [...prev.waitingQueue]

    if (activeIdx !== -1) {
      playerToMove = prev.activeQueue[activeIdx]
      sourceQueueType = QUEUE_TYPES.ACTIVE
      updatedActive.splice(activeIdx, 1)
    } else if (waitingIdx !== -1) {
      playerToMove = prev.waitingQueue[waitingIdx]
      sourceQueueType = QUEUE_TYPES.WAITING
      updatedWaiting.splice(waitingIdx, 1)
    }

    if (!playerToMove) return prev

    if (!targetPlayerName) {
      targetPlayerName = playerToMove.displayedUsername || playerToMove.username
    }
    isMoved = true

    if (targetQueueType === QUEUE_TYPES.ACTIVE) {
      const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, updatedActive.length) : updatedActive.length
      updatedActive.splice(insertIndex, 0, playerToMove)
    } else {
      const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, updatedWaiting.length) : updatedWaiting.length
      updatedWaiting.splice(insertIndex, 0, playerToMove)
    }

    return {
      ...prev,
      activeQueue: updatedActive,
      waitingQueue: updatedWaiting,
    }
  })

  setTimeout(() => {
    if (isMoved && sourceQueueType) {
      const fromLabel = QUEUE_TYPE_LABELS[sourceQueueType]
      const toLabel = QUEUE_TYPE_LABELS_ACCUSATIVE[targetQueueType]
      const positionLabel = targetIndex !== undefined ? ` на позицию ${targetIndex + 1}` : ' в конец'

      const logMessage = sourceQueueType === targetQueueType
        ? `Игрок ${targetPlayerName} перемещен внутри ${fromLabel}${positionLabel}.`
        : `Игрок ${targetPlayerName} перенесен из ${fromLabel} в ${toLabel}${positionLabel}.`

      pushLog({ message: logMessage, status: APP_LOG_STATUSES.INFO, source, actorUsername })
    } else {
      pushLog({
        message: 'Ошибка перемещения: игрок не найден в списках очередей.',
        status: APP_LOG_STATUSES.ERROR,
        source,
        actorUsername,
      })
    }
  }, 0)
}
