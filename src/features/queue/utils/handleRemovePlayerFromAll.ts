import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerFromAllArgs {
  /** Уникальный ID пользователя на Twitch для полного удаления отовсюду */
  userId: string;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил удаление */
  actorUsername: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для полного удаления игрока из ВСЕХ существующих очередей одновременно.
 */
export const handleRemovePlayerFromAll = ({
  userId,
  source,
  actorUsername,
  rawCommand,
  setState,
  pushLog,
}: HandleRemovePlayerFromAllArgs): void => {
  let targetPlayerName = ''
  let removedFromActiveCount = 0
  let removedFromFutureCount = 0

  setState(prev => {
    const activeMatches = prev.activeQueue.filter(p => p.userId === userId)
    if (activeMatches.length > 0) {
      targetPlayerName = activeMatches[0].displayedUsername || activeMatches[0].username
      removedFromActiveCount = activeMatches.length
    }

    const futureMatches = prev.futureQueue.filter(p => p.userId === userId)
    if (futureMatches.length > 0 && !targetPlayerName) {
      targetPlayerName = futureMatches[0].displayedUsername || futureMatches[0].username
    }
    removedFromFutureCount = futureMatches.length

    if (removedFromActiveCount === 0 && removedFromFutureCount === 0) {
      return prev
    }

    return {
      ...prev,
      activeQueue: prev.activeQueue.filter(p => p.userId !== userId),
      futureQueue: prev.futureQueue.filter(p => p.userId !== userId),
    }
  })

  const totalRemoved = removedFromActiveCount + removedFromFutureCount

  if (totalRemoved > 0) {
    const locations: string[] = []
    if (removedFromActiveCount > 0) locations.push(`активной (${removedFromActiveCount})`)
    if (removedFromFutureCount > 0) locations.push(`будущей (${removedFromFutureCount})`)

    const logMessage = `Игрок ${targetPlayerName || `с ID ${userId}`} удален из всех очередей: ${locations.join(' и ')}.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
  } else {
    const logMessage = `Ошибка отмены записи: игрок с ID ${userId} не найден ни в одном из списков.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
  }
}
