import { type MoveDecision, type QueueHandlerArgs } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_MOVE_LOG_MESSAGES, QUEUE_TYPE_LABELS_LOCATIVE } from '../../../constants/queue.constants.ts'
import { decideMove, type MovePlayerArgs } from './decideMove.ts'
import { formatMoveLog } from './formatMoveLog.ts'
import { hasSameQueueOrder } from './queuePlayers.utils.ts'

type HandleMovePlayerArgs = QueueHandlerArgs & MovePlayerArgs

export const handleMovePlayer = ({
  queueEntryId,
  userId,
  sourceQueueType,
  targetQueueType,
  targetIndex,
  displayedUsername,
  maxQueueSize,
  allowPreJoin,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
}: HandleMovePlayerArgs): MoveDecision => {
  const prev = getState()
  const decision = decideMove({
    prev,
    queueEntryId,
    userId,
    sourceQueueType,
    targetQueueType,
    targetIndex,
    displayedUsername,
    maxQueueSize,
    allowPreJoin,
  })

  if (decision.isMoved && hasSameQueueOrder(prev, decision.nextState)) {
    return { ...decision, isMoved: false, isNoop: true }
  }

  setState(decision.nextState)

  if (decision.isMoved) {
    pushLog({
      message: formatMoveLog(decision, targetQueueType),
      status: APP_LOG_STATUSES.INFO,
      source,
      actorUsername,
    })
    return decision
  }

  if (decision.isBlockedByDuplicate) {
    pushLog({
      message: QUEUE_MOVE_LOG_MESSAGES.DUPLICATE(
        decision.playerName,
        QUEUE_TYPE_LABELS_LOCATIVE[targetQueueType],
      ),
      status: APP_LOG_STATUSES.ERROR,
      source,
      actorUsername,
    })
    return decision
  }

  if (decision.isBlockedByDisabledWaiting) {
    pushLog({
      message: QUEUE_MOVE_LOG_MESSAGES.WAITING_DISABLED(),
      status: APP_LOG_STATUSES.ERROR,
      source,
      actorUsername,
    })
    return decision
  }

  pushLog({
    message: QUEUE_MOVE_LOG_MESSAGES.NOT_FOUND(),
    status: APP_LOG_STATUSES.ERROR,
    source,
    actorUsername,
  })

  return decision
}
