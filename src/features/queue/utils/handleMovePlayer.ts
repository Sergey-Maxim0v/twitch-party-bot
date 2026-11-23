import {
  QUEUE_TYPES,
  type MutableQueueType,
  type QueueHandlerArgs,
  type QueuePlayer,
  type QueueState,
} from '../types'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import {
  DEFAULT_QUEUE_SETTINGS,
  QUEUE_MOVE_LOG_MESSAGES,
  QUEUE_TYPE_LABELS,
  QUEUE_TYPE_LABELS_ACCUSATIVE,
  QUEUE_TYPE_LABELS_LOCATIVE,
} from '../../../constants/queue.constants.ts'
import { formatQueuePlayerNames } from './formatQueuePlayerNames.ts'
import { hasQueuePlayer } from './hasQueuePlayer.ts'

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

/** Решение по перемещению игрока: новое состояние и результат операции. */
export interface MoveDecision {
  /** Состояние очереди после перемещения. */
  nextState: QueueState;
  /** Был ли игрок перемещён. */
  isMoved: boolean;
  /** Было ли перемещение отклонено из-за дубликата. */
  isBlockedByDuplicate: boolean;
  /** Было ли перемещение отклонено из-за отключённого списка ожидающих. */
  isBlockedByDisabledWaiting: boolean;
  /** Очередь, из которой перемещён игрок. */
  sourceQueueType: MutableQueueType | null;
  /** Отображаемое имя игрока. */
  playerName: string;
  /** Фактическая позиция вставки (0-based). */
  insertIndex: number | null;
  /** Игроки, вытесненные в начало списка ожидающих. */
  displacedToWaiting: QueuePlayer[];
  /** Игроки, удалённые из очереди. */
  displacedRemoved: QueuePlayer[];
  /** Игроки, удалённые из активной очереди, но уже находящиеся в ожидающих. */
  displacedAlreadyWaiting: QueuePlayer[];
}

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
 * Создаёт решение об отказе от перемещения.
 *
 * @returns Решение с исходным состоянием очереди.
 */
const createMoveDecision = (
  prev: QueueState,
  playerName: string,
  sourceQueueType: MutableQueueType | null,
  overrides: Partial<MoveDecision> = {},
): MoveDecision => ({
  nextState: prev,
  isMoved: false,
  isBlockedByDuplicate: false,
  isBlockedByDisabledWaiting: false,
  sourceQueueType,
  playerName,
  insertIndex: null,
  displacedToWaiting: [],
  displacedRemoved: [],
  displacedAlreadyWaiting: [],
  ...overrides,
})

/**
 * Рассчитывает результат перемещения игрока между списками очереди.
 *
 * @returns Новое состояние очереди и результат операции.
 */
const decideMove = ({
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
  const sourceQueue = sourceQueueType === QUEUE_TYPES.ACTIVE ? prev.activeQueue : prev.waitingQueue
  const player = sourceQueue.find(item => item.queueEntryId === queueEntryId)

  if (!player || player.userId !== userId) {
    return createMoveDecision(prev, displayedUsername || '', null)
  }

  const playerName = displayedUsername || player.displayedUsername || player.username
  const isCrossQueueMove = sourceQueueType !== targetQueueType
  const targetQueue = targetQueueType === QUEUE_TYPES.ACTIVE ? prev.activeQueue : prev.waitingQueue

  if (isCrossQueueMove && targetQueueType === QUEUE_TYPES.WAITING && !allowPreJoin) {
    return createMoveDecision(prev, playerName, sourceQueueType, { isBlockedByDisabledWaiting: true })
  }

  if (isCrossQueueMove && hasQueuePlayer(targetQueue, player)) {
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

  const targetQueueLength = targetQueueType === QUEUE_TYPES.ACTIVE ? activeQueue.length : waitingQueue.length
  const insertIndex = targetIndex !== undefined ? Math.min(targetIndex, targetQueueLength) : targetQueueLength

  if (targetQueueType === QUEUE_TYPES.ACTIVE) {
    activeQueue.splice(insertIndex, 0, player)
  } else {
    waitingQueue.splice(insertIndex, 0, player)
  }

  return {
    nextState: { ...prev, activeQueue, waitingQueue },
    isMoved: true,
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

/**
 * Формирует сообщение журнала о выполненном перемещении.
 *
 * @returns Текст записи в журнале.
 */
const formatMoveLog = (
  decision: MoveDecision,
  targetQueueType: MutableQueueType,
  targetIndex: number | undefined,
): string => {
  const fromLabel = decision.sourceQueueType ? QUEUE_TYPE_LABELS[decision.sourceQueueType] : ''
  const toLabel = QUEUE_TYPE_LABELS_ACCUSATIVE[targetQueueType]
  const positionLabel = targetIndex === undefined
    ? ' в конец'
    : ` на позицию ${(decision.insertIndex ?? 0) + 1}`

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

/**
 * Перемещает игрока внутри одной очереди или между ними (Drag-and-Drop).
 * При переносе в заполненную активную очередь вытесняет последних игроков.
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
  const decision = decideMove({
    prev: getState(),
    queueEntryId,
    userId,
    sourceQueueType,
    targetQueueType,
    targetIndex,
    displayedUsername,
    maxQueueSize,
    allowPreJoin,
  })

  setState(decision.nextState)

  if (decision.isMoved) {
    pushLog({
      message: formatMoveLog(decision, targetQueueType, targetIndex),
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
