import type { MutableQueueType, MoveDecision } from '../types'
import {
  QUEUE_MOVE_LOG_MESSAGES,
  QUEUE_MOVE_LOG_POSITIONS,
  QUEUE_TYPE_LABELS,
  QUEUE_TYPE_LABELS_ACCUSATIVE,
} from '../../../constants/queue.constants.ts'
import { formatDisplacedLog } from './formatDisplacedLog.ts'
import { getQueueByType } from './queuePlayers.utils.ts'

/** Формирует текст записи журнала о перемещении игрока. */
export const formatMoveLog = (
  decision: MoveDecision,
  targetQueueType: MutableQueueType,
): string => {
  const fromLabel = decision.sourceQueueType ? QUEUE_TYPE_LABELS[decision.sourceQueueType] : ''
  const toLabel = QUEUE_TYPE_LABELS_ACCUSATIVE[targetQueueType]
  const finalQueue = getQueueByType(
    decision.nextState.activeQueue,
    decision.nextState.waitingQueue,
    targetQueueType,
  )
  const finalQueueLength = finalQueue.length
  const isAtEnd = decision.insertIndex !== null && decision.insertIndex === finalQueueLength - 1
  const positionLabel = isAtEnd
    ? QUEUE_MOVE_LOG_POSITIONS.END
    : QUEUE_MOVE_LOG_POSITIONS.AT((decision.insertIndex ?? 0) + 1)

  const baseMessage = decision.sourceQueueType === targetQueueType
    ? QUEUE_MOVE_LOG_MESSAGES.WITHIN(decision.playerName, fromLabel, positionLabel)
    : QUEUE_MOVE_LOG_MESSAGES.CROSS(decision.playerName, fromLabel, toLabel, positionLabel)

  return [baseMessage, ...formatDisplacedLog(decision)].join(' ')
}
