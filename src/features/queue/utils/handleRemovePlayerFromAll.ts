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

  const futureMatches = state.futureQueue.filter(isTargetPlayer)
  const removedFromFutureCount = futureMatches.length
  if (removedFromFutureCount > 0 && !targetPlayerName) {
    targetPlayerName = futureMatches[0].displayedUsername || futureMatches[0].username
  }

  const totalRemoved = removedFromActiveCount + removedFromFutureCount

  // Если игрок не найден ни по ID, ни по имени
  if (totalRemoved === 0) {
    const logMessage = `Ошибка отмены записи: игрок ${username} (ID: ${userId}) не найден ни в одном из списков.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    return
  }

  // Игрок найден
  const locations: string[] = []
  if (removedFromActiveCount > 0) locations.push(`активной (${removedFromActiveCount})`)
  if (removedFromFutureCount > 0) locations.push(`будущей (${removedFromFutureCount})`)

  const logMessage = `Игрок ${targetPlayerName || username} удален из всех очередей: ${locations.join(' и ')}.`

  setState({
    ...state,
    activeQueue: state.activeQueue.filter(p => !isTargetPlayer(p)),
    futureQueue: state.futureQueue.filter(p => !isTargetPlayer(p)),
  })

  pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
}
