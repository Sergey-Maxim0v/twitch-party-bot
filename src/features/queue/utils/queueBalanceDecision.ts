import type { QueueSettings } from '../../queue-settings/types.ts'
import { QUEUE_BALANCE_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import type { QueueActorContext, QueuePlayer, QueueState, QueueStateAccess } from '../types.ts'
import { getEffectiveQueueLimit } from './getEffectiveQueueLimit.ts'
import { getQueuePlayerName, hasQueuePlayer, isPrivilegedPlayer } from './queuePlayers.utils.ts'
import { getQueueCooldownRestriction, type QueueCooldownSettings } from './queueValidation.utils.ts'

export type QueueBalanceSettings = Pick<QueueSettings, 'allowPreJoin' | 'maxQueueSize' | 'moveOnSizeChange' | 'prioritizeSubscribers' | 'subscribersOnly'>

export interface QueueBalanceArgs extends QueueBalanceSettings, QueueActorContext, QueueStateAccess {
  cooldowns: QueueCooldownSettings;
  onPlayersMovedToActive?: (usernames: string[]) => void;
  onPlayersMovedToWaiting?: (usernames: string[]) => void;
  onPlayersRemoved?: (usernames: string[]) => void;
}

export interface BalanceDecision {
  nextState: QueueState;
  logMessage: string | null;
  movedToActive: string[];
  movedToWaiting: string[];
  removedPlayers: string[];
}

export type DecideBalanceArgs = Pick<
  QueueBalanceArgs,
  'maxQueueSize' | 'moveOnSizeChange' | 'allowPreJoin' | 'prioritizeSubscribers' | 'subscribersOnly' | 'cooldowns'
> & { prev: QueueState }

const createBalanceDecision = (prev: QueueState, overrides: Partial<BalanceDecision> = {}): BalanceDecision => ({
  nextState: prev,
  logMessage: null,
  movedToActive: [],
  movedToWaiting: [],
  removedPlayers: [],
  ...overrides,
})

const decideOverflow = ({
  prev,
  maxQueueSize,
  allowPreJoin,
}: Pick<DecideBalanceArgs, 'prev' | 'maxQueueSize' | 'allowPreJoin'>): BalanceDecision => {
  const queueLimit = getEffectiveQueueLimit(maxQueueSize)
  const overflowPlayers = prev.activeQueue.slice(queueLimit)
  const activeQueue = prev.activeQueue.slice(0, queueLimit)

  if (!allowPreJoin) {
    return createBalanceDecision({ ...prev, activeQueue }, {
      logMessage: QUEUE_BALANCE_LOG_MESSAGES.REMOVED_OVERFLOW(overflowPlayers.length),
      removedPlayers: overflowPlayers.map(getQueuePlayerName),
    })
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

  return createBalanceDecision({
    ...prev,
    activeQueue,
    waitingQueue: [...playersToAdd, ...prev.waitingQueue],
  }, {
    logMessage,
    movedToWaiting: playersToAdd.map(getQueuePlayerName),
  })
}

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

    const restriction = getQueueCooldownRestriction({ username: player.username, state: prev, settings: cooldowns })

    if (restriction) {
      skippedByRestriction += 1
      continue
    }

    playersToMove.push(player)
  }

  if (playersToMove.length === 0 && skippedByRestriction === 0 && skippedBySubscribersOnly === 0) {
    return createBalanceDecision(prev)
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

  return createBalanceDecision(
    playersToMove.length > 0 ? { ...prev, activeQueue, waitingQueue } : prev,
    {
      logMessage,
      movedToActive: playersToMove.map(getQueuePlayerName),
    },
  )
}

export const decideBalance = ({
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
    return createBalanceDecision(prev)
  }

  return decideMoveFromWaiting({ prev, maxQueueSize: queueLimit, cooldowns, prioritizeSubscribers, subscribersOnly })
}
