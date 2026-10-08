import type { Dispatch, SetStateAction } from 'react'
import { QUEUE_TYPES, type QueueState, type QueueType } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleMovePlayerArgs {
  /** Уникальный ID пользователя на Twitch для перемещения */
  userId: string;
  /** Целевой тип очереди, куда перетаскивают игрока */
  targetQueueType: Exclude<QueueType, 'history'>;
  /** Индекс (позиция), куда нужно вставить игрока (если не передан — падает в конец) */
  targetIndex: number | undefined;
  /** Никнейм для отображения */
  displayedUsername?: string;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил перемещение */
  actorUsername: string;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для перемещения игрока внутри одной очереди или между ними (Drag-and-Drop).
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
    // 1. Ищем игрока в обеих очередях, чтобы понять откуда его забираем
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

    // Если игрок вообще не найден в текущих списках, ничего не делаем
    if (!playerToMove) return prev

    if (!targetPlayerName) {
      targetPlayerName = playerToMove.displayedUsername || playerToMove.username
    }
    isMoved = true

    // 2. Вставляем игрока в целевую очередь
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

  // 3. Логируем результат перемещения
  setTimeout(() => {
    if (isMoved && sourceQueueType) {
      // 1. Формируем понятные названия для очередей
      const queueLabels = {
        [QUEUE_TYPES.ACTIVE]: 'активной очереди',
        [QUEUE_TYPES.WAITING]: 'списка ожидающих',
      }

      const fromLabel = queueLabels[sourceQueueType]
      const toLabel = targetQueueType === QUEUE_TYPES.ACTIVE ? 'активную очередь' : 'список ожидающих'

      // 2. Формируем позицию (человеческий индекс с 1)
      const positionLabel = targetIndex !== undefined ? ` на позицию ${targetIndex + 1}` : ' в конец'

      // 3. Собираем текст сообщения без лишних повторов
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
