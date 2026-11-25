import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import type {
  JoinDecision,
  JoinPlayerStateArgs,
  QueueActionContext,
  QueueJoinResult,
  QueueJoinStatus,
  QueuePlayerFormData,
  QueueState,
  QueueStateAccess,
} from '../types'
import { QUEUE_JOIN_LOG_MESSAGES, QUEUE_JOIN_STATUSES } from '../../../constants/queue.constants.ts'
import { createEmptyJoinDisplaced } from './createEmptyJoinDisplaced.ts'
import { createJoinPlayer } from './createJoinPlayer.ts'
import { decideJoinDisplacement } from './decideJoinDisplacement.ts'
import { getEffectiveQueueLimit } from './getEffectiveQueueLimit.ts'
import { insertQueuePlayer } from './insertQueuePlayer.ts'
import { hasQueuePlayer, isPrivilegedPlayer } from './queuePlayers.utils.ts'
import { validateQueueEntry } from './queueValidation.utils.ts'

interface DecideJoinArgs extends JoinPlayerStateArgs {
  isQueueOpen: QueueContextValue['isQueueOpen'];
  isPrivileged: boolean;
  settings: QueueSettings;
  source: QueueActionContext['source'];
}

interface HandleJoinPlayerArgs extends QueueStateAccess, Omit<DecideJoinArgs, 'prev' | 'player' | 'isPrivileged'> {
  playerData: QueuePlayerFormData;
  customTimestamp?: number;
  actorUsername: string;
  silentLog?: boolean;
}

const denyJoin = (prev: QueueState, logMessage: string): JoinDecision => ({
  status: QUEUE_JOIN_STATUSES.DENIED,
  logMessage,
  nextState: prev,
  displaced: createEmptyJoinDisplaced(),
})

const join = (status: QueueJoinStatus, logMessage: string, nextState: QueueState): JoinDecision => ({
  status,
  logMessage,
  nextState,
  displaced: createEmptyJoinDisplaced(),
})

const decideJoin = ({ prev, player, isQueueOpen, isPrivileged, settings, source }: DecideJoinArgs): JoinDecision => {
  const validationError = validateQueueEntry({ isQueueOpen, username: player.username, isPrivileged, state: prev, settings, source })
  if (validationError) return denyJoin(prev, validationError)

  const displayName = player.displayedUsername || player.username
  const isActiveQueueNotFull = prev.activeQueue.length < getEffectiveQueueLimit(settings.maxQueueSize)
  const isPrioritized = Boolean(settings.prioritizeSubscribers) && isPrivileged
  const isInActive = hasQueuePlayer(prev.activeQueue, player)
  const isInWaiting = hasQueuePlayer(prev.waitingQueue, player)

  if (!isInActive && isActiveQueueNotFull) {
    return join(QUEUE_JOIN_STATUSES.JOINED, QUEUE_JOIN_LOG_MESSAGES.ACTIVE(displayName), {
      ...prev,
      activeQueue: insertQueuePlayer(prev.activeQueue, player, isPrioritized),
    })
  }

  const firstRegularIndex = !isInActive && !isInWaiting && !isActiveQueueNotFull && isPrioritized
    ? prev.activeQueue.findIndex(queuePlayer => !isPrivilegedPlayer(queuePlayer))
    : -1

  if (firstRegularIndex !== -1) return decideJoinDisplacement({ prev, player, firstRegularIndex, allowPreJoin: settings.allowPreJoin })

  if (!settings.allowPreJoin) return denyJoin(prev, isInActive ? QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE(displayName) : QUEUE_JOIN_LOG_MESSAGES.DENIED_FULL())

  if (isInActive && !settings.allowMultipleEntries) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_REJOIN(displayName))
  if (isInActive && isInWaiting) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE_AND_WAITING(displayName))
  if (!isInActive && isInWaiting) return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_WAITING(displayName))

  const message = isInActive ? QUEUE_JOIN_LOG_MESSAGES.PREJOIN(displayName) : QUEUE_JOIN_LOG_MESSAGES.WAITING(displayName)

  return join(QUEUE_JOIN_STATUSES.WAITING, message, {
    ...prev,
    waitingQueue: insertQueuePlayer(prev.waitingQueue, player, isPrioritized),
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
  const player = createJoinPlayer({ playerData, customTimestamp, settings })

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
    displaced: decision.displaced,
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
