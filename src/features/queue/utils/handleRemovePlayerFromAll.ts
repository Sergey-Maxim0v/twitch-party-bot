import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerFromAllArgs {
  /** Уникальный ID пользователя на Twitch */
  userId: string;
  /** Логин пользователя на Twitch */
  username: string;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил удаление */
  actorUsername: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
  /** Текущее состояние очереди */
  state: QueueState;
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
  source,
  actorUsername,
  rawCommand,
  state,
  setState,
  pushLog,
}: HandleRemovePlayerFromAllArgs): void => {
  const targetUsernameLower = username.toLowerCase()
  let targetPlayerName = ''

  // Функция-предикат для поиска совпадений по ID или по логину
  const isTargetPlayer = (p: { userId: string; username: string }) =>
    p.userId === userId || p.username.toLowerCase() === targetUsernameLower

  const activeMatches = state.activeQueue.filter(isTargetPlayer)
  const removedFromActiveCount = activeMatches.length
  if (removedFromActiveCount > 0) {
    targetPlayerName = activeMatches[0].displayedUsername || activeMatches[0].username
  }

  const waitingMatches = state.waitingQueue.filter(isTargetPlayer)
  const removedFromWaitingCount = waitingMatches.length
  if (removedFromWaitingCount > 0 && !targetPlayerName) {
    targetPlayerName = waitingMatches[0].displayedUsername || waitingMatches[0].username
  }

  const totalRemoved = removedFromActiveCount + removedFromWaitingCount

  // Если игрок не найден ни по ID, ни по имени
  if (totalRemoved === 0) {
    const logMessage = `Ошибка отмены записи: игрок ${username} (ID: ${userId}) не найден ни в одном из списков.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    return
  }

  // Игрок найден
  let logMessage: string
  const displayName = targetPlayerName || username

  if (removedFromActiveCount > 0 && removedFromWaitingCount > 0) {
    logMessage = `Игрок ${displayName} удален из активной очереди (${removedFromActiveCount}) и списка ожидающих (${removedFromWaitingCount}).`
  } else if (removedFromActiveCount > 0) {
    logMessage = `Игрок ${displayName} удален из активной очереди (${removedFromActiveCount}).`
  } else if (removedFromWaitingCount > 0) {
    logMessage = `Игрок ${displayName} удален из списка ожидающих (${removedFromWaitingCount}).`
  } else {
    logMessage = `Игрок ${displayName} не найден в очередях.`
  }

  setState({
    ...state,
    activeQueue: state.activeQueue.filter(p => !isTargetPlayer(p)),
    waitingQueue: state.waitingQueue.filter(p => !isTargetPlayer(p)),
  })

  pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
}
