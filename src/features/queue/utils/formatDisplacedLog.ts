import { QUEUE_MOVE_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import type { QueueJoinDisplaced } from '../types.ts'
import { formatQueuePlayerNames } from './queuePlayers.utils.ts'

/** Детали журнала о вытесненных игроках. */
export const formatDisplacedLog = (displaced: QueueJoinDisplaced): string[] => [
  ...(displaced.displacedToWaiting.length > 0
    ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_TO_WAITING(formatQueuePlayerNames(displaced.displacedToWaiting))]
    : []),
  ...(displaced.displacedRemoved.length > 0
    ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_REMOVED(formatQueuePlayerNames(displaced.displacedRemoved))]
    : []),
  ...(displaced.displacedAlreadyWaiting.length > 0
    ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_ALREADY_WAITING(formatQueuePlayerNames(displaced.displacedAlreadyWaiting))]
    : []),
]
