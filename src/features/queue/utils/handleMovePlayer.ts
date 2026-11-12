import { QUEUE_TYPES, type QueueHandlerArgs, type QueueState, type QueueType } from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { QUEUE_TYPE_LABELS, QUEUE_TYPE_LABELS_ACCUSATIVE, QUEUE_TYPE_LABELS_LOCATIVE, QUEUE_LOG_PREFIXES } from '../../../constants/queue.constants.ts'
import { hasQueuePlayerWithUsername } from './queuePlayerIdentity.ts'

interface HandleMovePlayerArgs extends QueueHandlerArgs {
  /** Уникальный ID пользователя на Twitch для перемещения */
  userId: string;
  /** Целевой тип очереди, куда перетаскивают игрока */
  targetQueueType: Exclude<QueueType, 'history'>;
  /** Индекс (позиция), куда нужно вставить игрока (если не передан — падает в конец) */
  targetIndex: number | undefined;
  /** Никнейм для отображения */
  displayedUsername?: string;
}

/** Решение по перемещению игрока: новое состояние и результат операции. */
export interface MoveDecision {
  /** Состояние очереди после перемещения. */
  nextState: QueueState;
  /** Был ли игрок перемещён. */
  isMoved: boolean;
  /** Было ли перемещение отклонено из-за дубликата. */
  isBlockedByDuplicate: boolean;
  /** Очередь, из которой перемещён игрок. */
  sourceQueueType: Exclude<QueueType, 'history'> | null;
  /** Отображаемое имя игрока. */
  playerName: string;
}

/** Аргументы расчёта решения по перемещению игрока. */
interface DecideMoveArgs {
  /** Состояние очереди до перемещения. */
  prev: QueueState;
  /** Уникальный ID пользователя на Twitch для перемещения. */
  userId: string;
  /** Целевой тип очереди, куда перемещают игрока. */
  targetQueueType: Exclude<QueueType, 'history'>;
  /** Индекс (позиция), куда нужно вставить игрока. */
  targetIndex: number | undefined;
  /** Никнейм для отображения. */
  displayedUsername?: string;
}

/**
 * Рассчитывает результат перемещения игрока между списками очереди.
 *
 * @returns Новое состояние очереди и результат операции.
 */
const decideMove = ({
  prev,
  userId,
  targetQueueType,
  targetIndex,
  displayedUsername,
}: DecideMoveArgs): MoveDecision => {
  const activeIndex = prev.activeQueue.findIndex(p => p.userId === userId)
  const waitingIndex = prev.waitingQueue.findIndex(p => p.userId === userId)
  const playerInActive = activeIndex !== -1 ? prev.activeQueue[activeIndex] : null
  const playerInWaiting = waitingIndex !== -1 ? prev.waitingQueue[waitingIndex] : null
  const player = playerInActive ?? playerInWaiting

  if (!player) {
    return {
      nextState: prev,
      isMoved: false,
      isBlockedByDuplicate: false,
      sourceQueueType: null,
      playerName: displayedUsername || '',
    }
  }

  const sourceQueueType = activeIndex !== -1 ? QUEUE_TYPES.ACTIVE : QUEUE_TYPES.WAITING
  const playerName = displayedUsername || player.displayedUsername || player.username
  const activeQueue = [...prev.activeQueue]
  const waitingQueue = [...prev.waitingQueue]

  if (sourceQueueType === QUEUE_TYPES.ACTIVE) {
    activeQueue.splice(activeIndex, 1)
  } else {
    waitingQueue.splice(waitingIndex, 1)
  }

  const targetQueue = targetQueueType === QUEUE_TYPES.ACTIVE ? activeQueue : waitingQueue
  const isCrossQueueMove = sourceQueueType !== targetQueueType

  if (isCrossQueueMove && hasQueuePlayerWithUsername(targetQueue, player.username)) {
    return {
      nextState: prev,
      isMoved: false,
      isBlockedByDuplicate: true,
      sourceQueueType,
      playerName,
    }
  }

  const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, targetQueue.length) : targetQueue.length
  targetQueue.splice(insertIndex, 0, player)

  return {
    nextState: { ...prev, activeQueue, waitingQueue },
    isMoved: true,
    isBlockedByDuplicate: false,
    sourceQueueType,
    playerName,
  }
}

/**
 * Перемещает игрока внутри одной очереди или между ними (Drag-and-Drop).
 *
 * @returns Результат перемещения и состояние очереди после операции.
 */
export const handleMovePlayer = ({
  userId,
  targetQueueType,
  targetIndex,
  displayedUsername,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
}: HandleMovePlayerArgs): MoveDecision => {
  const decision = decideMove({
    prev: getState(),
    userId,
    targetQueueType,
    targetIndex,
    displayedUsername,
  })

  setState(decision.nextState)

  if (decision.isMoved && decision.sourceQueueType) {
    const fromLabel = QUEUE_TYPE_LABELS[decision.sourceQueueType]
    const toLabel = QUEUE_TYPE_LABELS_ACCUSATIVE[targetQueueType]
    const positionLabel = targetIndex !== undefined ? ` на позицию ${targetIndex + 1}` : ' в конец'

    const logMessage = decision.sourceQueueType === targetQueueType
      ? `Игрок ${decision.playerName} перемещен внутри ${fromLabel}${positionLabel}.`
      : `Игрок ${decision.playerName} перенесен из ${fromLabel} в ${toLabel}${positionLabel}.`

    pushLog({ message: logMessage, status: APP_LOG_STATUSES.INFO, source, actorUsername })
    return decision
  }

  if (decision.isBlockedByDuplicate) {
    pushLog({
      message: `${QUEUE_LOG_PREFIXES.MOVE}: Отклонено, игрок ${decision.playerName || 'игрок'} уже находится в ${QUEUE_TYPE_LABELS_LOCATIVE[targetQueueType]}.`,
      status: APP_LOG_STATUSES.ERROR,
      source,
      actorUsername,
    })
    return decision
  }

  pushLog({
    message: 'Ошибка перемещения: игрок не найден в списках очередей.',
    status: APP_LOG_STATUSES.ERROR,
    source,
    actorUsername,
  })

  return decision
}
