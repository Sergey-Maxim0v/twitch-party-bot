import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import type {
  QueueActionContext,
  QueueJoinResult,
  QueueJoinStatus,
  QueuePlayer,
  QueuePlayerFormData,
  QueueState,
  QueueStateAccess,
} from '../types'
import {
  QUEUE_ENTRY_ID_PREFIX,
  QUEUE_JOIN_LOG_MESSAGES,
  QUEUE_JOIN_STATUSES,
} from '../../../constants/queue.constants.ts'
import { createId } from '../../../utils/createId.ts'
import { getEffectiveQueueLimit } from './getEffectiveQueueLimit.ts'
import { hasQueuePlayer, isPrivilegedPlayer } from './queuePlayers.utils.ts'
import { extractGameNickname, validateQueueEntry } from './queueValidation.utils.ts'

interface HandleJoinPlayerArgs extends QueueActionContext, QueueStateAccess {
  isQueueOpen: QueueContextValue['isQueueOpen'];
  playerData: QueuePlayerFormData;
  customTimestamp?: number;
  settings: QueueSettings;
}

interface JoinDecision {
  status: QueueJoinStatus;
  logMessage: string;
  nextState: QueueState;
}

interface DecideJoinArgs {
  prev: QueueState;
  player: QueuePlayer;
  isQueueOpen: QueueContextValue['isQueueOpen'];
  isPrivileged: boolean;
  settings: QueueSettings;
  source: QueueActionContext['source'];
}

const insertPlayer = (queue: QueuePlayer[], player: QueuePlayer, prioritize: boolean): QueuePlayer[] => {
  if (!prioritize) return [...queue, player]

  const firstRegularIndex = queue.findIndex(p => !isPrivilegedPlayer(p))
  const insertIndex = firstRegularIndex === -1 ? queue.length : firstRegularIndex

  return [...queue.slice(0, insertIndex), player, ...queue.slice(insertIndex)]
}

const denyJoin = (prev: QueueState, logMessage: string): JoinDecision => ({
  status: QUEUE_JOIN_STATUSES.DENIED,
  logMessage,
  nextState: prev,
})

const join = (status: QueueJoinStatus, logMessage: string, nextState: QueueState): JoinDecision => ({
  status,
  logMessage,
  nextState,
})

const decideJoin = ({
  prev,
  player,
  isQueueOpen,
  isPrivileged,
  settings,
  source,
}: DecideJoinArgs): JoinDecision => {
  const validationError = validateQueueEntry({
    isQueueOpen,
    username: player.username,
    isPrivileged,
    state: prev,
    settings,
    source,
  })
  if (validationError) return denyJoin(prev, validationError)

  const displayName = player.displayedUsername || player.username
  const maxActiveSize = getEffectiveQueueLimit(settings.maxQueueSize)
  const isActiveQueueNotFull = prev.activeQueue.length < maxActiveSize
  const isPrioritized = Boolean(settings.prioritizeSubscribers) && isPrivileged
  const isInActive = hasQueuePlayer(prev.activeQueue, player)
  const isInWaiting = hasQueuePlayer(prev.waitingQueue, player)

  if (!isInActive && isActiveQueueNotFull) {
    return join(QUEUE_JOIN_STATUSES.JOINED, QUEUE_JOIN_LOG_MESSAGES.ACTIVE(displayName), {
      ...prev,
      activeQueue: insertPlayer(prev.activeQueue, player, isPrioritized),
    })
  }

  // Приоритетный игрок занимает место первого простого, который уходит в ожидание.
  const firstRegularIndex = !isInActive && !isInWaiting && !isActiveQueueNotFull && isPrioritized
    ? prev.activeQueue.findIndex(queuePlayer => !isPrivilegedPlayer(queuePlayer))
    : -1

  if (firstRegularIndex !== -1) {
    const activeQueue = [...prev.activeQueue]
    activeQueue.splice(firstRegularIndex, 0, player)
    const displaced = activeQueue.pop()!
    const canWait = settings.allowPreJoin && !hasQueuePlayer(prev.waitingQueue, displaced)

    return join(QUEUE_JOIN_STATUSES.JOINED, QUEUE_JOIN_LOG_MESSAGES.ACTIVE(displayName), {
      ...prev,
      activeQueue,
      waitingQueue: canWait ? [displaced, ...prev.waitingQueue] : prev.waitingQueue,
    })
  }

  if (!settings.allowPreJoin) {
    const message = isInActive
      ? QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE(displayName)
      : QUEUE_JOIN_LOG_MESSAGES.DENIED_FULL()

    return denyJoin(prev, message)
  }

  if (isInActive && !settings.allowMultipleEntries) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_REJOIN(displayName))
  if (isInActive && isInWaiting) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE_AND_WAITING(displayName))
  if (!isInActive && isInWaiting) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_WAITING(displayName))

  const message = isInActive
    ? QUEUE_JOIN_LOG_MESSAGES.PREJOIN(displayName)
    : QUEUE_JOIN_LOG_MESSAGES.WAITING(displayName)

  return join(QUEUE_JOIN_STATUSES.WAITING, message, {
    ...prev,
    waitingQueue: insertPlayer(prev.waitingQueue, player, isPrioritized),
  })
}

export const handleJoinPlayer = ({
  isQueueOpen,
  playerData,
  source,
  actorUsername,
  customTimestamp,
  settings,
  getState,
  setState,
  pushLog,
  silentLog = false,
}: HandleJoinPlayerArgs): QueueJoinResult => {
  const player: QueuePlayer = {
    ...playerData,
    queueEntryId: createId(QUEUE_ENTRY_ID_PREFIX),
    timestamp: customTimestamp || Date.now(),
    gameNickname: extractGameNickname({
      rawMessage: playerData.rawMessage,
      gameConfig: settings.currentGame,
      commandNames: Object.values(settings.commands).map(command => command.name),
    }),
    isVip: playerData.isVip ?? false,
    isModerator: playerData.isModerator ?? false,
    isSubscriber: playerData.isSubscriber ?? false,
  }

  const prev = getState()
  const decision = decideJoin({
    prev,
    player,
    isQueueOpen,
    isPrivileged: isPrivilegedPlayer(player),
    settings,
    source,
  })

  setState(decision.nextState)

  const result: QueueJoinResult = {
    status: decision.status,
    message: decision.logMessage,
    logStatus: decision.status === QUEUE_JOIN_STATUSES.DENIED ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
  }

  if (!silentLog) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
