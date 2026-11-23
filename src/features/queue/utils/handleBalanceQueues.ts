import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type LogSource } from '../../app-logs/types.ts'
import type { Dispatch, SetStateAction } from 'react'
import type { QueuePlayer, QueueState } from '../types.ts'
import { QUEUE_BALANCE_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { getEffectiveQueueLimit } from './getEffectiveQueueLimit.ts'
import { getQueueCooldownRestriction, type QueueCooldownSettings } from './getQueueCooldownRestriction.ts'
import { hasQueuePlayer } from './hasQueuePlayer.ts'
import { isPrivilegedPlayer } from './isPrivilegedPlayer.ts'

/** Настройки, влияющие на балансировку активной очереди и списка ожидающих. */
type QueueBalanceSettings = Pick<
  QueueSettings,
  'allowPreJoin' | 'maxQueueSize' | 'moveOnSizeChange' | 'prioritizeSubscribers' | 'subscribersOnly'
>

/** Аргументы балансировки очередей. */
interface HandleBalanceQueuesArgs extends QueueBalanceSettings {
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
  /** Колбэк, возвращающий список имён игроков, перемещённых в активную очередь. */
  onPlayersMovedToActive?: (usernames: string[]) => void;
  /** Колбэк, возвращающий список имён игроков, перемещённых в список ожидающих. */
  onPlayersMovedToWaiting?: (usernames: string[]) => void;
  /** Колбэк, возвращающий список имён удалённых игроков. */
  onPlayersRemoved?: (usernames: string[]) => void;
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
  /** Никнеймы удалённых игроков. */
  removedPlayers: string[];
}

/** Аргументы расчёта решения по балансировке. */
interface DecideBalanceArgs extends QueueBalanceSettings {
  /** Состояние очереди до балансировки. */
  prev: QueueState;
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
  removedPlayers: [],
})

/**
 * Убирает из активной очереди лишних игроков.
 * При включённом списке ожидающих переносит их в начало списка, иначе удаляет.
 *
 * @returns Новое состояние очереди и описание выполненных действий.
 */
const decideOverflow = ({
  prev,
  maxQueueSize,
  allowPreJoin,
}: Pick<DecideBalanceArgs, 'prev' | 'maxQueueSize' | 'allowPreJoin'>): BalanceDecision => {
  const queueLimit = getEffectiveQueueLimit(maxQueueSize)
  const overflowPlayers = prev.activeQueue.slice(queueLimit)
  const activeQueue = prev.activeQueue.slice(0, queueLimit)

  if (!allowPreJoin) {
    return {
      nextState: { ...prev, activeQueue },
      logMessage: QUEUE_BALANCE_LOG_MESSAGES.REMOVED_OVERFLOW(overflowPlayers.length),
      movedToActive: [],
      movedToWaiting: [],
      removedPlayers: overflowPlayers.map(p => p.displayedUsername ?? p.username),
    }
  }

  const playersToAdd: QueuePlayer[] = []
  const duplicates: QueuePlayer[] = []

  overflowPlayers.forEach(player => {
    if (hasQueuePlayer(prev.waitingQueue, player) || hasQueuePlayer(playersToAdd, player)) {
      duplicates.push(player)
      return
    }

    playersToAdd.push(player)
  })

  const logMessage = [
    ...(playersToAdd.length > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.MOVED_TO_WAITING(playersToAdd.length)] : []),
    ...(duplicates.length > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.REMOVED_OVERFLOW_DUPLICATES(duplicates.length)] : []),
  ].join(' ')

  return {
    nextState: {
      ...prev,
      activeQueue,
      waitingQueue: [...playersToAdd, ...prev.waitingQueue],
    },
    logMessage,
    movedToActive: [],
    movedToWaiting: playersToAdd.map(p => p.displayedUsername ?? p.username),
    removedPlayers: [],
  }
}

/**
 * Переносит в активную очередь игроков из списка ожидающих,
 * для которых не действуют кулдауны, лимит игр и режим «только для подписчиков».
 *
 * @returns Новое состояние очереди и описание выполненных переносов.
 */
const decideMoveFromWaiting = ({
  prev,
  maxQueueSize,
  cooldowns,
  prioritizeSubscribers,
  subscribersOnly,
}: Pick<
  DecideBalanceArgs,
  'prev' | 'maxQueueSize' | 'cooldowns' | 'prioritizeSubscribers' | 'subscribersOnly'
>): BalanceDecision => {
  const freeSlots = getEffectiveQueueLimit(maxQueueSize) - prev.activeQueue.length
  const playersToMove: QueuePlayer[] = []
  let skippedByRestriction = 0
  let skippedBySubscribersOnly = 0

  const candidates = prioritizeSubscribers
    ? [...prev.waitingQueue].sort((a, b) => Number(isPrivilegedPlayer(b)) - Number(isPrivilegedPlayer(a)))
    : prev.waitingQueue

  for (const player of candidates) {
    if (playersToMove.length >= freeSlots) break

    const isDuplicate = hasQueuePlayer(playersToMove, player) || hasQueuePlayer(prev.activeQueue, player)
    if (isDuplicate) continue

    if (subscribersOnly && !isPrivilegedPlayer(player)) {
      skippedBySubscribersOnly += 1
      continue
    }

    const restriction = getQueueCooldownRestriction({
      username: player.username,
      state: prev,
      settings: cooldowns,
    })

    if (restriction) {
      skippedByRestriction += 1
      continue
    }

    playersToMove.push(player)
  }

  if (playersToMove.length === 0 && skippedByRestriction === 0 && skippedBySubscribersOnly === 0) {
    return noChanges(prev)
  }

  const waitingQueue = prev.waitingQueue.filter(player => !hasQueuePlayer(playersToMove, player))
  let activeQueue = [...prev.activeQueue]

  if (prioritizeSubscribers) {
    const firstRegularIndex = activeQueue.findIndex(p => !isPrivilegedPlayer(p))
    const insertIndex = firstRegularIndex === -1 ? activeQueue.length : firstRegularIndex
    const privilegedPlayers = playersToMove.filter(isPrivilegedPlayer)
    const regularPlayers = playersToMove.filter(p => !isPrivilegedPlayer(p))

    activeQueue = [
      ...activeQueue.slice(0, insertIndex),
      ...privilegedPlayers,
      ...activeQueue.slice(insertIndex),
      ...regularPlayers,
    ]
  } else {
    activeQueue = [...activeQueue, ...playersToMove]
  }

  const logMessage = [
    ...(playersToMove.length > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.MOVED_TO_ACTIVE(playersToMove.length)] : []),
    ...(skippedByRestriction > 0 ? [QUEUE_BALANCE_LOG_MESSAGES.SKIPPED_BY_RESTRICTION(skippedByRestriction)] : []),
    ...(skippedBySubscribersOnly > 0
      ? [QUEUE_BALANCE_LOG_MESSAGES.SKIPPED_BY_SUBSCRIBERS_ONLY(skippedBySubscribersOnly)]
      : []),
  ].join(' ')

  return {
    nextState: playersToMove.length > 0
      ? { ...prev, activeQueue, waitingQueue }
      : prev,
    logMessage,
    movedToActive: playersToMove.map(p => p.displayedUsername ?? p.username),
    movedToWaiting: [],
    removedPlayers: [],
  }
}

/**
 * Рассчитывает результат балансировки активной очереди и списка ожидающих.
 *
 * @returns Новое состояние очереди и описание выполненных действий.
 */
const decideBalance = ({
  prev,
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  prioritizeSubscribers,
  subscribersOnly,
  cooldowns,
}: DecideBalanceArgs): BalanceDecision => {
  const activeLength = prev.activeQueue.length
  const waitingLength = prev.waitingQueue.length
  const queueLimit = getEffectiveQueueLimit(maxQueueSize)

  if (activeLength > queueLimit) {
    return decideOverflow({ prev, maxQueueSize: queueLimit, allowPreJoin })
  }

  const canMoveFromWaiting = moveOnSizeChange
    && allowPreJoin
    && activeLength < queueLimit
    && waitingLength > 0

  if (!canMoveFromWaiting) {
    return noChanges(prev)
  }

  return decideMoveFromWaiting({
    prev,
    maxQueueSize: queueLimit,
    cooldowns,
    prioritizeSubscribers,
    subscribersOnly,
  })
}

/**
 * Переносит игроков между активной очередью и списком ожидания
 * на основе актуального состояния.
 */
export const handleBalanceQueues = ({
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  prioritizeSubscribers,
  subscribersOnly,
  cooldowns,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
  onPlayersMovedToActive,
  onPlayersMovedToWaiting,
  onPlayersRemoved,
}: HandleBalanceQueuesArgs): void => {
  const decision = decideBalance({
    prev: getState(),
    maxQueueSize,
    moveOnSizeChange,
    allowPreJoin,
    prioritizeSubscribers,
    subscribersOnly,
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

  if (decision.removedPlayers.length > 0 && onPlayersRemoved) {
    onPlayersRemoved(decision.removedPlayers)
  }
}
