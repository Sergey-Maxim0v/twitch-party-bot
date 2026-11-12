import type { QueueHandlerArgs, QueueState } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_LOG_PREFIXES, QUEUE_TYPE_LABELS } from '../../../constants/queue.constants.ts'

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

/** Решение по удалению игрока из всех очередей: новое состояние и текст журнала. */
interface RemoveFromAllDecision {
  /** Состояние очереди после удаления. */
  nextState: QueueState;
  /** Текст для журнала приложения. */
  logMessage: string;
  /** Была ли операция ошибочной. */
  isError: boolean;
}

/** Аргументы расчёта решения по удалению игрока из всех очередей. */
interface DecideRemoveFromAllArgs {
  /** Состояние очереди до удаления. */
  prev: QueueState;
  /** Уникальный ID пользователя на Twitch. */
  userId: string;
  /** Логин пользователя на Twitch. */
  username: string;
  /** Отображаемое имя игрока. */
  displayedUsername?: string;
}

/**
 * Рассчитывает результат удаления игрока из всех списков очереди.
 *
 * @returns Новое состояние очереди и текст для журнала.
 */
const decideRemoveFromAll = ({
  prev,
  userId,
  username,
  displayedUsername,
}: DecideRemoveFromAllArgs): RemoveFromAllDecision => {
  const targetUsername = username.toLowerCase()
  const isTargetPlayer = (p: { userId: string; username: string }): boolean =>
    p.userId === userId || p.username.toLowerCase() === targetUsername

  const activeMatches = prev.activeQueue.filter(isTargetPlayer)
  const waitingMatches = prev.waitingQueue.filter(isTargetPlayer)

  if (activeMatches.length === 0 && waitingMatches.length === 0) {
    const nameToLog = displayedUsername || username

    return {
      nextState: prev,
      logMessage: `${QUEUE_LOG_PREFIXES.REMOVE_ALL}: Ошибка, игрок ${nameToLog} не найден ни в одном из списков.`,
      isError: true,
    }
  }

  const activePlayerName = activeMatches[0]?.displayedUsername || activeMatches[0]?.username
  const waitingPlayerName = waitingMatches[0]?.displayedUsername || waitingMatches[0]?.username
  const playerName = displayedUsername || activePlayerName || waitingPlayerName || username

  const removedFromActive = activeMatches.length > 0
  const removedFromWaiting = waitingMatches.length > 0
  const removedFrom = [
    removedFromActive ? QUEUE_TYPE_LABELS.active : null,
    removedFromWaiting ? QUEUE_TYPE_LABELS.waiting : null,
  ].filter(label => label !== null).join(' и ')

  return {
    nextState: {
      ...prev,
      activeQueue: prev.activeQueue.filter(p => !isTargetPlayer(p)),
      waitingQueue: prev.waitingQueue.filter(p => !isTargetPlayer(p)),
    },
    logMessage: `${QUEUE_LOG_PREFIXES.REMOVE_ALL}: ${playerName} удален из ${removedFrom}.`,
    isError: false,
  }
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
  getState,
  setState,
  pushLog,
}: HandleRemovePlayerFromAllArgs): void => {
  const decision = decideRemoveFromAll({
    prev: getState(),
    userId,
    username,
    displayedUsername,
  })

  setState(decision.nextState)

  pushLog({
    message: decision.logMessage,
    status: decision.isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
    rawCommand,
  })
}
