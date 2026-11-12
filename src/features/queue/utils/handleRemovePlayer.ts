import { QUEUE_TYPES, type QueueHandlerArgs, type QueueState, type QueueType } from '../types'
import { APP_LOG_STATUSES, APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_LOG_PREFIXES, QUEUE_TYPE_LABELS_LOCATIVE } from '../../../constants/queue.constants.ts'

interface HandleRemovePlayerArgs extends QueueHandlerArgs {
  /** Уникальный ID пользователя на Twitch для удаления */
  userId: string;
  /** Из какой именно очереди нужно удалить игрока */
  targetQueueType: QueueType;
  /** Имя игрока для отображения */
  displayedUsername?: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
}

/** Решение по удалению игрока: новое состояние и текст журнала. */
interface RemoveDecision {
  /** Состояние очереди после удаления. */
  nextState: QueueState;
  /** Текст для журнала приложения. */
  logMessage: string;
  /** Была ли операция ошибочной. */
  isError: boolean;
}

/** Аргументы расчёта решения по удалению игрока. */
interface DecideRemoveArgs {
  /** Состояние очереди до удаления. */
  prev: QueueState;
  /** Уникальный ID пользователя на Twitch для удаления. */
  userId: string;
  /** Очередь, из которой удаляется игрок. */
  targetQueueType: QueueType;
  /** Имя игрока для отображения. */
  displayedUsername?: string;
}

/**
 * Рассчитывает результат удаления игрока из указанной очереди.
 *
 * @returns Новое состояние очереди и текст для журнала.
 */
const decideRemove = ({
  prev,
  userId,
  targetQueueType,
  displayedUsername,
}: DecideRemoveArgs): RemoveDecision => {
  const isTargetActive = targetQueueType === QUEUE_TYPES.ACTIVE
  const queue = isTargetActive ? prev.activeQueue : prev.waitingQueue
  const queueLabel = isTargetActive
    ? QUEUE_TYPE_LABELS_LOCATIVE.active
    : QUEUE_TYPE_LABELS_LOCATIVE.waiting
  const index = queue.findIndex(p => p.userId === userId)

  if (index === -1) {
    const nameOrId = displayedUsername || `ID ${userId}`

    return {
      nextState: prev,
      logMessage: `${QUEUE_LOG_PREFIXES.REMOVE}: Ошибка, игрок ${nameOrId} не найден в ${queueLabel}.`,
      isError: true,
    }
  }

  const player = queue[index]
  const playerName = displayedUsername || player.displayedUsername || player.username
  const nextQueue = queue.filter((_, playerIndex) => playerIndex !== index)

  return {
    nextState: isTargetActive
      ? { ...prev, activeQueue: nextQueue }
      : { ...prev, waitingQueue: nextQueue },
    logMessage: `${QUEUE_LOG_PREFIXES.REMOVE}: ${playerName} удален из ${queueLabel}.`,
    isError: false,
  }
}

/**
 * Удаляет первую найденную запись игрока из указанной очереди.
 */
export const handleRemovePlayer = ({
  userId,
  targetQueueType,
  displayedUsername,
  source,
  actorUsername,
  rawCommand,
  getState,
  setState,
  pushLog,
}: HandleRemovePlayerArgs): void => {
  if (targetQueueType === QUEUE_TYPES.HISTORY) {
    pushLog({
      message: `${QUEUE_LOG_PREFIXES.REMOVE}: Ошибка, из истории нельзя удалить игрока`,
      source: APP_LOG_SOURCES.APPLICATION,
      status: APP_LOG_STATUSES.ERROR,
      actorUsername,
    })
    return
  }

  const decision = decideRemove({
    prev: getState(),
    userId,
    targetQueueType,
    displayedUsername,
  })

  setState(decision.nextState)

  pushLog({
    message: decision.logMessage,
    status: decision.isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
    rawCommand,
  })
}
