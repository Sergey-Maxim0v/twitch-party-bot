import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerFromAllArgs {
  /** Уникальный ID пользователя на Twitch */
  userId: string;
  /** Логин пользователя на Twitch */
  username: string;
  /** Отображаемое имя игрока */
  displayedUsername?: string;
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
  username,
  displayedUsername,
  source,
  actorUsername,
  rawCommand,
  setState,
  pushLog,
}: HandleRemovePlayerFromAllArgs): void => {
  const targetUsernameLower = username.toLowerCase()

  // Функция-предикат для поиска совпадений по ID или по логину
  const isTargetPlayer = (p: { userId: string; username: string }) =>
    p.userId === userId || p.username.toLowerCase() === targetUsernameLower

  let logMessageText: string = ''
  let isError = false

  setState(prev => {
    let targetPlayerName = displayedUsername || ''

    const activeMatches = prev.activeQueue.filter(isTargetPlayer)
    const removedFromActiveCount = activeMatches.length
    if (removedFromActiveCount > 0 && !targetPlayerName) {
      targetPlayerName = activeMatches[0].displayedUsername || activeMatches[0].username
    }

    const waitingMatches = prev.waitingQueue.filter(isTargetPlayer)
    const removedFromWaitingCount = waitingMatches.length
    if (removedFromWaitingCount > 0 && !targetPlayerName) {
      targetPlayerName = waitingMatches[0].displayedUsername || waitingMatches[0].username
    }

    const totalRemoved = removedFromActiveCount + removedFromWaitingCount

    // Если игрок не найден ни по ID, ни по имени
    if (totalRemoved === 0) {
      isError = true
      const nameToLog = displayedUsername || username
      logMessageText = `Удаление из всех очередей: Ошибка, игрок ${nameToLog} не найден ни в одном из списков.`
      return prev
    }

    const displayName = targetPlayerName || displayedUsername || username

    if (removedFromActiveCount > 0 && removedFromWaitingCount > 0) {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из активной очереди и списка ожидающих.`
    } else if (removedFromActiveCount > 0) {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из активной очереди.`
    } else if (removedFromWaitingCount > 0) {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из списка ожидающих.`
    } else {
      logMessageText = `Удаление из всех очередей: Ошибка, ${displayName} не найден.`
    }

    return {
      ...prev,
      activeQueue: prev.activeQueue.filter(p => !isTargetPlayer(p)),
      waitingQueue: prev.waitingQueue.filter(p => !isTargetPlayer(p)),
    }
  })

  setTimeout(() => {
    pushLog({
      message: logMessageText,
      status: isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
      source,
      actorUsername,
      rawCommand,
    })
  }, 0)
}
