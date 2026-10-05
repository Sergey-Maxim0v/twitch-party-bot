import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { Dispatch, SetStateAction } from 'react'
import type { QueuePlayer, QueueState } from '../types.ts'

export interface HandleBalanceQueuesArgs {
  maxQueueSize: QueueSettings['maxQueueSize'];
  moveOnSizeChange: QueueSettings['moveOnSizeChange'];
  allowPreJoin: QueueSettings['allowPreJoin'];
  source: LogSource;
  actorUsername: string;
  setState: Dispatch<SetStateAction<QueueState>>;
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Перенос игроков между текущей очередью и списком ожидания на основе актуального стейта.
 */
export const handleBalanceQueues = ({
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  source,
  actorUsername,
  setState,
  pushLog,
}: HandleBalanceQueuesArgs): void => {
  let logMessageText: string | null = null

  setState(prev => {
    const activeLength = prev.activeQueue.length
    const waitingLength = prev.waitingQueue.length

    // === СЦЕНАРИЙ 1: Очередь уменьшилась / переполнена ===
    if (activeLength > maxQueueSize) {
      const count = activeLength - maxQueueSize
      const updatedActive = [...prev.activeQueue]
      const movedPlayers = updatedActive.splice(maxQueueSize)
      const updatedWaiting = [...prev.waitingQueue]

      if (moveOnSizeChange && allowPreJoin) {
        updatedWaiting.unshift(...movedPlayers)
      }

      if (moveOnSizeChange && allowPreJoin) {
        logMessageText = `Автоматически перенесено игроков из активной очереди в начало списка ожидающих: ${count}.`
      } else {
        logMessageText = `Лишние игроки удалены из активной очереди: ${count}.`
      }

      return {
        ...prev,
        activeQueue: updatedActive,
        waitingQueue: updatedWaiting,
      }
    }

    // === СЦЕНАРИЙ 2: Очередь увеличилась / освободились места ===
    if (moveOnSizeChange && activeLength < maxQueueSize && waitingLength > 0) {
      const freeSlots = maxQueueSize - activeLength
      const updatedActive = [...prev.activeQueue]
      const sourceWaiting = [...prev.waitingQueue]

      const playersToMove: QueuePlayer[] = []
      const indicesToRemove: number[] = []

      const activeUserIds = new Set(updatedActive.map(p => p.userId))
      const activeUsernames = new Set(updatedActive.map(p => p.username.toLowerCase()))

      for (let i = 0; i < sourceWaiting.length; i++) {
        if (playersToMove.length >= freeSlots) break

        const player = sourceWaiting[i]
        const isDuplicate = activeUserIds.has(player.userId) || activeUsernames.has(player.username.toLowerCase())

        if (isDuplicate) continue

        playersToMove.push(player)
        indicesToRemove.push(i)

        activeUserIds.add(player.userId)
        activeUsernames.add(player.username.toLowerCase())
      }

      if (playersToMove.length === 0) return prev

      logMessageText = `Автоматически перенесено игроков из списка ожидающих в конец активной очереди: ${playersToMove.length}.`

      const realWaiting = sourceWaiting.filter((_, idx) => !indicesToRemove.includes(idx))
      updatedActive.push(...playersToMove)

      return {
        ...prev,
        activeQueue: updatedActive,
        waitingQueue: realWaiting,
      }
    }

    return prev
  })

  setTimeout(() => {
    if (logMessageText) {
      pushLog({
        message: logMessageText,
        status: APP_LOG_STATUSES.SUCCESS,
        source,
        actorUsername,
      })
    }
  }, 0)
}
