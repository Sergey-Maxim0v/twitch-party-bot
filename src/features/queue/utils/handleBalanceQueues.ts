import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { Dispatch, SetStateAction } from 'react'
import type { QueuePlayer, QueueState } from '../types.ts'
import { QUEUE_BALANCE_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { getQueueCooldownRestriction, type QueueCooldownSettings } from './getQueueCooldownRestriction.ts'
import { normalizeQueueUsername } from './queuePlayerIdentity.ts'

interface HandleBalanceQueuesArgs {
  /** Максимальный размер активной очереди. */
  maxQueueSize: QueueSettings['maxQueueSize'];
  /** Переносить ли игроков при изменении размера очереди. */
  moveOnSizeChange: QueueSettings['moveOnSizeChange'];
  /** Разрешена ли запись в список ожидающих. */
  allowPreJoin: QueueSettings['allowPreJoin'];
  /** Настройки кулдаунов и лимита игр. */
  cooldowns: QueueCooldownSettings;
  /** Источник вызова команды. */
  source: LogSource;
  /** Никнейм того, кто запустил балансировку. */
  actorUsername: string;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog'];
  /** Колбэк, возвращающий список имен игроков, перемещенных в активную очередь */
  onPlayersMovedToActive?: (usernames: string[]) => void;
  /** Колбэк, возвращающий список имен игроков, перемещенных в список ожидающих */
  onPlayersMovedToWaiting?: (usernames: string[]) => void;
}

/** Решение по балансировке: новое состояние и список выполненных переносов. */
interface BalanceDecision {
  /** Состояние очереди после балансировки. */
  nextState: QueueState;
  /** Текст для журнала приложения. */
  logMessage: string | null;
  /** Никнеймы игроков, перемещённых в активную очередь. */
  movedToActive: string[];
  /** Никнеймы игроков, перемещённых в список ожидающих. */
  movedToWaiting: string[];
}

/** Аргументы расчёта решения по балансировке. */
interface DecideBalanceArgs {
  /** Состояние очереди до балансировки. */
  prev: QueueState;
  /** Максимальный размер активной очереди. */
  maxQueueSize: QueueSettings['maxQueueSize'];
  /** Переносить ли игроков при изменении размера очереди. */
  moveOnSizeChange: QueueSettings['moveOnSizeChange'];
  /** Разрешена ли запись в список ожидающих. */
  allowPreJoin: QueueSettings['allowPreJoin'];
  /** Настройки кулдаунов и лимита игр. */
  cooldowns: QueueCooldownSettings;
}

/**
 * Создаёт решение без изменений состояния очереди.
 *
 * @param prev - Состояние очереди до балансировки.
 * @returns Пустое решение с прежним состоянием.
 */
const noChanges = (prev: QueueState): BalanceDecision => ({
  nextState: prev,
  logMessage: null,
  movedToActive: [],
  movedToWaiting: [],
})

/**
 * Убирает из активной очереди лишних игроков, перенося их в список ожидающих.
 *
 * @returns Новое состояние очереди и описание выполненных переносов.
 */
const decideOverflow = ({
  prev,
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
}: Pick<DecideBalanceArgs, 'prev' | 'maxQueueSize' | 'moveOnSizeChange' | 'allowPreJoin'>): BalanceDecision => {
  const overflowCount = prev.activeQueue.length - maxQueueSize
  const activeQueue = prev.activeQueue.slice(0, maxQueueSize)
  const overflowPlayers = prev.activeQueue.slice(maxQueueSize)
  const shouldMoveToWaiting = moveOnSizeChange && allowPreJoin

  if (!shouldMoveToWaiting) {
    return {
      nextState: { ...prev, activeQueue },
      logMessage: QUEUE_BALANCE_LOG_MESSAGES.REMOVED_OVERFLOW(overflowCount),
      movedToActive: [],
      movedToWaiting: [],
    }
  }

  const waitingUsernames = new Set(prev.waitingQueue.map(p => normalizeQueueUsername(p.username)))
  const playersToAdd: QueuePlayer[] = []

  overflowPlayers.forEach(player => {
    const normalizedUsername = normalizeQueueUsername(player.username)
    if (waitingUsernames.has(normalizedUsername)) return

    waitingUsernames.add(normalizedUsername)
    playersToAdd.push(player)
  })

  const hasMovedPlayers = playersToAdd.length > 0

  return {
    nextState: { ...prev, activeQueue, waitingQueue: [...playersToAdd, ...prev.waitingQueue] },
    logMessage: hasMovedPlayers
      ? QUEUE_BALANCE_LOG_MESSAGES.MOVED_TO_WAITING(playersToAdd.length)
      : QUEUE_BALANCE_LOG_MESSAGES.REMOVED_OVERFLOW(overflowCount),
    movedToActive: [],
    movedToWaiting: playersToAdd.map(p => p.displayedUsername ?? p.username),
  }
}

/**
 * Переносит в конец активной очереди только тех игроков из списка ожидающих,
 * для которых не действуют кулдауны и лимит игр.
 *
 * @returns Новое состояние очереди и описание выполненных переносов.
 */
const decideMoveFromWaiting = ({
  prev,
  maxQueueSize,
  cooldowns,
}: Pick<DecideBalanceArgs, 'prev' | 'maxQueueSize' | 'cooldowns'>): BalanceDecision => {
  const freeSlots = maxQueueSize - prev.activeQueue.length
  const activeUserIds = new Set(prev.activeQueue.map(p => p.userId))
  const activeUsernames = new Set(prev.activeQueue.map(p => normalizeQueueUsername(p.username)))
  const playersToMove: QueuePlayer[] = []
  let skippedCount = 0

  const waitingQueue = prev.waitingQueue.filter(player => {
    if (playersToMove.length >= freeSlots) return true

    const normalizedUsername = normalizeQueueUsername(player.username)
    const isDuplicate = activeUserIds.has(player.userId) || activeUsernames.has(normalizedUsername)

    if (isDuplicate) return true

    const restriction = getQueueCooldownRestriction({
      username: player.username,
      state: prev,
      settings: cooldowns,
    })

    if (restriction) {
      skippedCount += 1
      return true
    }

    playersToMove.push(player)
    activeUserIds.add(player.userId)
    activeUsernames.add(normalizedUsername)

    return false
  })

  if (playersToMove.length === 0 && skippedCount === 0) {
    return noChanges(prev)
  }

  const logMessageParts = [
    ...(playersToMove.length > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.MOVED_TO_ACTIVE(playersToMove.length)] : []),
    ...(skippedCount > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.SKIPPED_BY_RESTRICTION(skippedCount)] : []),
  ]

  return {
    nextState: playersToMove.length > 0
      ? { ...prev, activeQueue: [...prev.activeQueue, ...playersToMove], waitingQueue }
      : prev,
    logMessage: logMessageParts.join(' '),
    movedToActive: playersToMove.map(p => p.displayedUsername ?? p.username),
    movedToWaiting: [],
  }
}

/**
 * Рассчитывает результат балансировки активной очереди и списка ожидающих.
 *
 * @returns Новое состояние очереди и описание выполненных переносов.
 */
const decideBalance = ({
  prev,
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  cooldowns,
}: DecideBalanceArgs): BalanceDecision => {
  const activeLength = prev.activeQueue.length
  const waitingLength = prev.waitingQueue.length

  if (activeLength > maxQueueSize) {
    return decideOverflow({ prev, maxQueueSize, moveOnSizeChange, allowPreJoin })
  }

  const canMoveFromWaiting = moveOnSizeChange && activeLength < maxQueueSize && waitingLength > 0

  if (!canMoveFromWaiting) {
    return noChanges(prev)
  }

  return decideMoveFromWaiting({ prev, maxQueueSize, cooldowns })
}

/**
 * Переносит игроков между активной очередью и списком ожидания
 * на основе актуального состояния.
 */
export const handleBalanceQueues = ({
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  cooldowns,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
  onPlayersMovedToActive,
  onPlayersMovedToWaiting,
}: HandleBalanceQueuesArgs): void => {
  const decision = decideBalance({
    prev: getState(),
    maxQueueSize,
    moveOnSizeChange,
    allowPreJoin,
    cooldowns,
  })

  setState(decision.nextState)

  if (decision.logMessage) {
    pushLog({
      message: decision.logMessage,
      status: APP_LOG_STATUSES.INFO,
      source,
      actorUsername,
    })
  }

  if (decision.movedToActive.length > 0 && onPlayersMovedToActive) {
    onPlayersMovedToActive(decision.movedToActive)
  }

  if (decision.movedToWaiting.length > 0 && onPlayersMovedToWaiting) {
    onPlayersMovedToWaiting(decision.movedToWaiting)
  }
}
