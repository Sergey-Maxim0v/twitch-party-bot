import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { LOG_SOURCE } from '../../app-logs/types.ts'
import type { QueueState, QueuePlayer } from '../types.ts'
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

    // 1. Сначала атомарно рассчитываем перенос вне setState (имитируем логику для лога)
    let playersMovedCount = 0
    setState(prev => {
      const updatedActive = [...prev.activeQueue]
      const sourceFuture = [...prev.futureQueue]

      const playersToMove: QueuePlayer[] = []
      const indicesToRemove: number[] = []

      const activeUserIds = new Set(updatedActive.map(p => p.userId))
      const activeUsernames = new Set(updatedActive.map(p => p.username.toLowerCase()))

      for (let i = 0; i < sourceFuture.length; i++) {
        if (playersToMove.length >= freeSlots) {
          break
        }

        const player = sourceFuture[i]
        const isDuplicate = activeUserIds.has(player.userId) || activeUsernames.has(player.username.toLowerCase())

        if (isDuplicate) {
          continue
        }

        playersToMove.push(player)
        indicesToRemove.push(i)

        activeUserIds.add(player.userId)
        activeUsernames.add(player.username.toLowerCase())
      }

      if (playersToMove.length === 0) {
        return prev
      }

      // Сохраняем точное количество перенесенных игроков
      playersMovedCount = playersToMove.length

      for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        sourceFuture.splice(indicesToRemove[i], 1)
      }

      updatedActive.push(...playersToMove)

      return {
        ...prev,
        activeQueue: updatedActive,
        futureQueue: sourceFuture,
      }
    })

    // 2. Отправляем лог 
    if (playersMovedCount > 0) {
      pushLog({
        message: `Размер очереди изменен. Автоматически перенесено игроков из будущей очереди в конец активной: ${playersMovedCount}.`,
        status: APP_LOG_STATUSES.SUCCESS,
        source: LOG_SOURCE.APPLICATION,
        actorUsername: 'System',
      })
    }
  }
}
