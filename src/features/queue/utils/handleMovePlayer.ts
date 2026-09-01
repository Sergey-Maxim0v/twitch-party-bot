import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleMovePlayerArgs {
  /** Уникальный ID пользователя на Twitch для перемещения */
  userId: string;
  /** Целевой тип очереди, куда перетаскивают игрока */
  targetQueueType: 'active' | 'future';
  /** Индекс (позиция), куда нужно вставить игрока (если не передан — падает в конец) */
  targetIndex: number | undefined;
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
  source,
  actorUsername,
  setState,
  pushLog,
}: HandleMovePlayerArgs): void => {
  let targetPlayerName = ''
  let sourceQueueType: 'active' | 'future' | null = null
  let isMoved = false

  setState(prev => {
    // 1. Ищем игрока в обеих очередях, чтобы понять откуда его забираем
    const activeIdx = prev.activeQueue.findIndex(p => p.userId === userId)
    const futureIdx = prev.futureQueue.findIndex(p => p.userId === userId)

    let playerToMove = null
    const updatedActive = [...prev.activeQueue]
    const updatedFuture = [...prev.futureQueue]

    if (activeIdx !== -1) {
      playerToMove = prev.activeQueue[activeIdx]
      sourceQueueType = 'active'
      updatedActive.splice(activeIdx, 1)
    } else if (futureIdx !== -1) {
      playerToMove = prev.futureQueue[futureIdx]
      sourceQueueType = 'future'
      updatedFuture.splice(futureIdx, 1)
    }

    // Если игрок вообще не найден в текущих списках, ничего не делаем
    if (!playerToMove) return prev

    targetPlayerName = playerToMove.displayedUsername || playerToMove.username
    isMoved = true

    // 2. Вставляем игрока в целевую очередь
    if (targetQueueType === 'active') {
      const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, updatedActive.length) : updatedActive.length
      updatedActive.splice(insertIndex, 0, playerToMove)
    } else {
      const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, updatedFuture.length) : updatedFuture.length
      updatedFuture.splice(insertIndex, 0, playerToMove)
    }

    return {
      ...prev,
      activeQueue: updatedActive,
      futureQueue: updatedFuture,
    }
  })

  // 3. Логируем результат перемещения
  if (isMoved) {
    const fromLabel = sourceQueueType === 'active' ? 'активной' : 'будущей'
    const toLabel = targetQueueType === 'active' ? 'активную' : 'будущую'
    const positionLabel = targetIndex !== undefined ? ` на позицию ${targetIndex + 1}` : ' в конец'

    const logMessage = sourceQueueType === targetQueueType
      ? `Перемещен игрок ${targetPlayerName} внутри ${fromLabel} очереди${positionLabel}.`
      : `Игрок ${targetPlayerName} перенесен из ${fromLabel} очереди в ${toLabel}${positionLabel}.`

    pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername })
  } else {
    const logMessage = `Ошибка перемещения: игрок с ID ${userId} не найден в очередях.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername })
  }
}
