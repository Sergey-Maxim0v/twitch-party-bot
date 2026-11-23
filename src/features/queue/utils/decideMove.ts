import {
  QUEUE_TYPES,
  type MutableQueueType,
  type MoveDecision,
  type QueuePlayer,
  type QueueState,
} from '../types'
import { DEFAULT_QUEUE_SETTINGS } from '../../../constants/queue.constants.ts'
import { createMoveDecision } from './createMoveDecision.ts'
import { getQueueByType } from './getQueueByType.ts'
import { hasQueuePlayer } from './hasQueuePlayer.ts'

/** Аргументы расчёта решения по перемещению игрока. */
interface DecideMoveArgs {
  /** Состояние очереди до перемещения. */
  prev: QueueState;
  /** Уникальный идентификатор перемещаемой записи. */
  queueEntryId: string;
  /** Уникальный ID пользователя на Twitch для перемещения. */
  userId: string;
  /** Список, из которого перемещают игрока. */
  sourceQueueType: MutableQueueType;
  /** Целевой тип очереди, куда перемещают игрока. */
  targetQueueType: MutableQueueType;
  /** Индекс (позиция), куда нужно вставить игрока. */
  targetIndex: number | undefined;
  /** Никнейм для отображения. */
  displayedUsername?: string;
  /** Максимальный размер активной очереди. */
  maxQueueSize: number;
  /** Разрешена ли запись в список ожидающих. */
  allowPreJoin: boolean;
}

/**
 * Рассчитывает решение о перемещении игрока внутри списка или между списками.
 *
 * @returns Новое состояние очереди и результат операции.
 */
export const decideMove = ({
  prev,
  queueEntryId,
  userId,
  sourceQueueType,
  targetQueueType,
  targetIndex,
  displayedUsername,
  maxQueueSize,
  allowPreJoin,
}: DecideMoveArgs): MoveDecision => {
  const sourceQueue = getQueueByType(prev.activeQueue, prev.waitingQueue, sourceQueueType)
  const player = sourceQueue.find(item => item.queueEntryId === queueEntryId)

  if (!player || player.userId !== userId) {
    return createMoveDecision(prev, displayedUsername || '', null)
  }

  const playerName = displayedUsername || player.displayedUsername || player.username
  const isCrossQueueMove = sourceQueueType !== targetQueueType
  const prevTargetQueue = getQueueByType(prev.activeQueue, prev.waitingQueue, targetQueueType)

  if (isCrossQueueMove && targetQueueType === QUEUE_TYPES.WAITING && !allowPreJoin) {
    return createMoveDecision(prev, playerName, sourceQueueType, { isBlockedByDisabledWaiting: true })
  }

  if (isCrossQueueMove && hasQueuePlayer(prevTargetQueue, player)) {
    return createMoveDecision(prev, playerName, sourceQueueType, { isBlockedByDuplicate: true })
  }

  let activeQueue = [...prev.activeQueue]
  let waitingQueue = [...prev.waitingQueue]

  if (sourceQueueType === QUEUE_TYPES.ACTIVE) {
    activeQueue = activeQueue.filter(item => item.queueEntryId !== player.queueEntryId)
  } else {
    waitingQueue = waitingQueue.filter(item => item.queueEntryId !== player.queueEntryId)
  }

  const displacedToWaiting: QueuePlayer[] = []
  const displacedRemoved: QueuePlayer[] = []
  const displacedAlreadyWaiting: QueuePlayer[] = []
  const queueLimit = maxQueueSize > 0 ? maxQueueSize : DEFAULT_QUEUE_SETTINGS.maxQueueSize

  if (
    targetQueueType === QUEUE_TYPES.ACTIVE
    && sourceQueueType === QUEUE_TYPES.WAITING
    && activeQueue.length >= queueLimit
  ) {
    const displacedCount = activeQueue.length - queueLimit + 1
    const displacedPlayers = activeQueue.slice(activeQueue.length - displacedCount)
    activeQueue = activeQueue.slice(0, activeQueue.length - displacedCount)

    displacedPlayers.forEach(displaced => {
      if (!allowPreJoin) {
        displacedRemoved.push(displaced)
        return
      }

      const isAlreadyWaiting = hasQueuePlayer(waitingQueue, displaced)
        || hasQueuePlayer(displacedToWaiting, displaced)

      if (isAlreadyWaiting) {
        displacedAlreadyWaiting.push(displaced)
        return
      }

      displacedToWaiting.push(displaced)
    })

    waitingQueue = [...displacedToWaiting, ...waitingQueue]
  }

  const nextTargetQueue = getQueueByType(activeQueue, waitingQueue, targetQueueType)
  const insertIndex = targetIndex === undefined
    ? nextTargetQueue.length
    : Math.min(targetIndex, nextTargetQueue.length)

  nextTargetQueue.splice(insertIndex, 0, player)

  return {
    nextState: { ...prev, activeQueue, waitingQueue },
    isMoved: true,
    isNoop: false,
    isBlockedByDuplicate: false,
    isBlockedByDisabledWaiting: false,
    sourceQueueType,
    playerName,
    insertIndex,
    displacedToWaiting,
    displacedRemoved,
    displacedAlreadyWaiting,
  }
}
