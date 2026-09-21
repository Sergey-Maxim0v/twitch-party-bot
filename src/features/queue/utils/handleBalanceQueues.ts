import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import type { QueueState } from '../types.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'

export interface HandleBalanceQueuesArgs {
  maxQueueSize: QueueSettings['maxQueueSize'];
  moveOnSizeChange: QueueSettings['moveOnSizeChange'];
  allowPreJoin: QueueSettings['allowPreJoin'];
  activeLength: number;
  futureLength: number;
  setState: Dispatch<SetStateAction<QueueState>>;
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Автоматически переносит игроков между очередями при изменении размера очереди (maxQueueSize).
 */
export const handleBalanceQueues = ({
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  activeLength,
  futureLength,
  setState,
  pushLog,
}: HandleBalanceQueuesArgs): void => {

  // === СЦЕНАРИЙ 1: Очередь уменьшилась ===
  if (activeLength > maxQueueSize) {
    const count = activeLength - maxQueueSize

    // 1. Сначала безопасно отправляем один лог
    if (moveOnSizeChange && allowPreJoin) {
      pushLog({
        message: `Размер очереди изменен. Автоматически перенесено игроков в начало будущей очереди: ${count}.`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: LOG_SOURCE.APPLICATION,
        actorUsername: 'System',
      })
    } else {
      pushLog({
        message: `Размер очереди уменьшен. Лишние игроки удалены из активной очереди: ${count}.`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: LOG_SOURCE.APPLICATION,
        actorUsername: 'System',
      })
    }

    // 2. Затем обновляем состояние (чистая функция)
    setState(prev => {
      const updatedActive = [...prev.activeQueue]
      const movedPlayers = updatedActive.splice(maxQueueSize)
      const updatedFuture = [...prev.futureQueue]

      if (moveOnSizeChange && allowPreJoin) {
        updatedFuture.unshift(...movedPlayers)
      }

      return {
        ...prev,
        activeQueue: updatedActive,
        futureQueue: updatedFuture,
      }
    })
    return
  }

  // === СЦЕНАРИЙ 2: Очередь увеличилась (работает только при активном moveOnSizeChange) ===
  if (moveOnSizeChange && activeLength < maxQueueSize && futureLength > 0) {
    const freeSlots = maxQueueSize - activeLength
    // Вычисляем, сколько реально игроков сможем забрать
    const count = Math.min(freeSlots, futureLength)

    // 1. Отправляем лог
    pushLog({
      message: `Размер очереди изменен. Автоматически перенесено игроков из будущей очереди в конец активной: ${count}.`,
      status: APP_LOG_STATUSES.SUCCESS,
      source: LOG_SOURCE.APPLICATION,
      actorUsername: 'System',
    })

    // 2. Обновляем состояние
    setState(prev => {
      const updatedFuture = [...prev.futureQueue]
      const playersToMove = updatedFuture.splice(0, freeSlots)
      const updatedActive = [...prev.activeQueue, ...playersToMove]

      return {
        ...prev,
        activeQueue: updatedActive,
        futureQueue: updatedFuture,
      }
    })
  }
}
