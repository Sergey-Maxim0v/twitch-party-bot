import type { QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_TYPE_LABELS } from '../../../constants/queue.constants.ts'

interface HandleRemovePlayerFromAllArgs extends QueueHandlerArgs {
  /** Уникальный ID пользователя на Twitch */
  userId: string;
  /** Логин пользователя на Twitch */
  username: string;
  /** Отображаемое имя игрока */
  displayedUsername?: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
}

/**
 * Удаляет игрока из всех существующих очередей одновременно.
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

    if (totalRemoved === 0) {
      isError = true
      const nameToLog = displayedUsername || username
      logMessageText = `Удаление из всех очередей: Ошибка, игрок ${nameToLog} не найден ни в одном из списков.`
      return prev
    }

    const displayName = targetPlayerName || displayedUsername || username

    if (removedFromActiveCount > 0 && removedFromWaitingCount > 0) {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из ${QUEUE_TYPE_LABELS.active} и ${QUEUE_TYPE_LABELS.waiting}.`
    } else if (removedFromActiveCount > 0) {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из ${QUEUE_TYPE_LABELS.active}.`
    } else {
      logMessageText = `Удаление из всех очередей: ${displayName} удален из ${QUEUE_TYPE_LABELS.waiting}.`
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
