import {
  type MutableQueueType,
  type MoveDecision,
  type QueueHandlerArgs,
} from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_MOVE_LOG_MESSAGES, QUEUE_TYPE_LABELS_LOCATIVE } from '../../../constants/queue.constants.ts'
import { decideMove } from './decideMove.ts'
import { formatMoveLog } from './formatMoveLog.ts'
import { hasSameQueueOrder } from './hasSameQueueOrder.ts'

interface HandleMovePlayerArgs extends QueueHandlerArgs {
  /** Уникальный идентификатор перемещаемой записи. */
  queueEntryId: string;
  /** Уникальный ID пользователя на Twitch для перемещения. */
  userId: string;
  /** Список, из которого перемещают игрока. */
  sourceQueueType: MutableQueueType;
  /** Целевой тип очереди, куда перетаскивают игрока. */
  targetQueueType: MutableQueueType;
  /** Индекс (позиция), куда нужно вставить игрока (если не передан — падает в конец). */
  targetIndex: number | undefined;
  /** Никнейм для отображения. */
  displayedUsername?: string;
  /** Максимальный размер активной очереди. */
  maxQueueSize: number;
  /** Разрешена ли запись в список ожидающих. */
  allowPreJoin: boolean;
}

/**
 * Перемещает игрока внутри одной очереди или между ними (Drag-and-Drop).
 * При переносе в заполненную активную очередь вытесняет последних игроков.
 * Если порядок не изменился, состояние не обновляется и запись в журнал не создаётся.
 *
 * @returns Результат перемещения и состояние очереди после операции.
 */
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
