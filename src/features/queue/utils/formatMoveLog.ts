import type { MutableQueueType, MoveDecision } from '../types'
import {
  QUEUE_MOVE_LOG_MESSAGES,
  QUEUE_MOVE_LOG_POSITIONS,
  QUEUE_TYPE_LABELS,
  QUEUE_TYPE_LABELS_ACCUSATIVE,
} from '../../../constants/queue.constants.ts'
import { formatQueuePlayerNames } from './formatQueuePlayerNames.ts'
import { getQueueByType } from './getQueueByType.ts'

/**
 * Формирует сообщение журнала о выполненном перемещении.
 *
 * @returns Текст записи в журнале.
 */
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

  const details = [
    ...(decision.displacedToWaiting.length > 0
      ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_TO_WAITING(formatQueuePlayerNames(decision.displacedToWaiting))]
      : []),
    ...(decision.displacedRemoved.length > 0
      ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_REMOVED(formatQueuePlayerNames(decision.displacedRemoved))]
      : []),
    ...(decision.displacedAlreadyWaiting.length > 0
      ? [QUEUE_MOVE_LOG_MESSAGES.DISPLACED_ALREADY_WAITING(formatQueuePlayerNames(decision.displacedAlreadyWaiting))]
      : []),
  ]

  return [baseMessage, ...details].join(' ')
}
