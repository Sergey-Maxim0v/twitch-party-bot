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
  setState(prev => {
    let targetPlayerName = ''

    const activeMatches = prev.activeQueue.filter(p => p.userId === userId)
    const removedFromActiveCount = activeMatches.length
    if (removedFromActiveCount > 0) {
      targetPlayerName = activeMatches[0].displayedUsername || activeMatches[0].username
    }

    const futureMatches = prev.futureQueue.filter(p => p.userId === userId)
    const removedFromFutureCount = futureMatches.length
    if (removedFromFutureCount > 0 && !targetPlayerName) {
      targetPlayerName = futureMatches[0].displayedUsername || futureMatches[0].username
    }

    const totalRemoved = removedFromActiveCount + removedFromFutureCount

    // Игрок не найден ни в одном списке
    if (totalRemoved === 0) {
      const logMessage = `Ошибка отмены записи: игрок с ID ${userId} не найден ни в одном из списков.`
      pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
      return prev
    }

    // Игрок найден
    const locations: string[] = []
    if (removedFromActiveCount > 0) locations.push(`активной (${removedFromActiveCount})`)
    if (removedFromFutureCount > 0) locations.push(`будущей (${removedFromFutureCount})`)

    const logMessage = `Игрок ${targetPlayerName || `с ID ${userId}`} удален из всех очередей: ${locations.join(' и ')}.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })

    return {
      ...prev,
      activeQueue: prev.activeQueue.filter(p => p.userId !== userId),
      futureQueue: prev.futureQueue.filter(p => p.userId !== userId),
    }
  })
}
