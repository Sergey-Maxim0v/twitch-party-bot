import { QUEUE_TYPES, type QueueHandlerArgs, type QueueState } from '../types'
import { APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_REMOVE_LOG_MESSAGES, QUEUE_TYPE_LABELS_LOCATIVE } from '../../../constants/queue.constants.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { isSameQueuePlayer } from './isSameQueuePlayer.ts'
import { resolvePlayerName } from './resolvePlayerName.ts'
import { toRemovePlayerResult, type RemovePlayerDecision, type RemovePlayerResult } from './removePlayerResult.ts'

/** Аргументы удаления из одной очереди. */
type HandleRemovePlayerArgs = QueueHandlerArgs & Pick<
  Parameters<QueueContextValue['removePlayerFromQueue']>[0],
  'userId' | 'username' | 'targetQueueType' | 'displayedUsername' | 'rawCommand'
>

interface RemoveDecision extends RemovePlayerDecision {
  /** Состояние очереди после удаления. */
  nextState: QueueState;
}

type DecideRemoveArgs = Pick<
  HandleRemovePlayerArgs,
  'userId' | 'username' | 'targetQueueType' | 'displayedUsername'
> & {
  /** Состояние очереди до удаления. */
  prev: QueueState;
}

/** Рассчитывает состояние и лог удаления из одной очереди. */
const decideRemove = ({
  prev,
  userId,
  username,
  targetQueueType,
  displayedUsername,
}: DecideRemoveArgs): RemoveDecision => {
  const isTargetActive = targetQueueType === QUEUE_TYPES.ACTIVE
  const queue = isTargetActive ? prev.activeQueue : prev.waitingQueue
  const queueLabel = isTargetActive
    ? QUEUE_TYPE_LABELS_LOCATIVE.active
    : QUEUE_TYPE_LABELS_LOCATIVE.waiting
  const target = { userId, username }
  const index = queue.findIndex(player => isSameQueuePlayer(target, player))

  if (index === -1) {
    const playerName = resolvePlayerName({ displayedUsername, userId })

    return {
      nextState: prev,
      logMessage: QUEUE_REMOVE_LOG_MESSAGES.NOT_FOUND(playerName, queueLabel),
      isError: true,
      playerName,
    }
  }

  const player = queue[index]
  const playerName = resolvePlayerName({ displayedUsername, username, player })
  const nextQueue = queue.filter((_, playerIndex) => playerIndex !== index)

  return {
    nextState: isTargetActive
      ? { ...prev, activeQueue: nextQueue }
      : { ...prev, waitingQueue: nextQueue },
    logMessage: QUEUE_REMOVE_LOG_MESSAGES.REMOVED(playerName, queueLabel),
    isError: false,
    playerName,
  }
}

const createHistoryErrorResult = (playerName: string): RemovePlayerResult =>
  toRemovePlayerResult({
    logMessage: QUEUE_REMOVE_LOG_MESSAGES.HISTORY_FORBIDDEN(),
    isError: true,
    playerName,
  })

/** Удаляет игрока из указанной очереди и возвращает результат операции. */
export const handleRemovePlayer = ({
  userId,
  username,
  targetQueueType,
  displayedUsername,
  source,
  actorUsername,
  rawCommand,
  getState,
  setState,
  pushLog,
}: HandleRemovePlayerArgs): RemovePlayerResult => {
  if (targetQueueType === QUEUE_TYPES.HISTORY) {
    const playerName = resolvePlayerName({ displayedUsername, username, userId })
    const result = createHistoryErrorResult(playerName)

    pushLog({
      message: result.message,
      status: result.logStatus,
      source: APP_LOG_SOURCES.APPLICATION,
      actorUsername,
    })

    return result
  }

  const decision = decideRemove({
    prev: getState(),
    userId,
    username,
    targetQueueType,
    displayedUsername,
  })

  setState(decision.nextState)

  const result = toRemovePlayerResult(decision)

  pushLog({
    message: result.message,
    status: result.logStatus,
    source,
    actorUsername,
    rawCommand,
  })

  return result
}
