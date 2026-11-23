import type { QueueHandlerArgs, QueuePlayer, QueueState } from '../types'
import { QUEUE_REMOVE_LOG_MESSAGES, QUEUE_TYPE_LABELS } from '../../../constants/queue.constants.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { isSameQueuePlayer } from './isSameQueuePlayer.ts'
import { resolvePlayerName } from './resolvePlayerName.ts'
import { toRemovePlayerResult, type RemovePlayerDecision, type RemovePlayerResult } from './removePlayerResult.ts'

/** Аргументы удаления из всех очередей. */
type HandleRemovePlayerFromAllArgs = QueueHandlerArgs & Pick<
  Parameters<QueueContextValue['removePlayerFromAllQueues']>[0],
  'userId' | 'username' | 'displayedUsername' | 'silentLog'
>

interface RemoveFromAllDecision extends RemovePlayerDecision {
  /** Состояние очереди после удаления. */
  nextState: QueueState;
}

type DecideRemoveFromAllArgs = Pick<
  HandleRemovePlayerFromAllArgs,
  'userId' | 'username' | 'displayedUsername'
> & {
  /** Состояние очереди до удаления. */
  prev: QueueState;
}

/** Рассчитывает состояние и лог удаления из всех очередей. */
const decideRemoveFromAll = ({
  prev,
  userId,
  username,
  displayedUsername,
}: DecideRemoveFromAllArgs): RemoveFromAllDecision => {
  const target = { userId, username }
  const isTargetPlayer = (player: QueuePlayer): boolean => isSameQueuePlayer(target, player)

  const activeMatches = prev.activeQueue.filter(isTargetPlayer)
  const waitingMatches = prev.waitingQueue.filter(isTargetPlayer)

  if (activeMatches.length === 0 && waitingMatches.length === 0) {
    const playerName = resolvePlayerName({ displayedUsername, username, userId })

    return {
      nextState: prev,
      logMessage: QUEUE_REMOVE_LOG_MESSAGES.NOT_FOUND_ANYWHERE(playerName),
      isError: true,
      playerName,
    }
  }

  const foundPlayer = activeMatches[0] ?? waitingMatches[0]
  const playerName = resolvePlayerName({ displayedUsername, username, player: foundPlayer })
  const removedFrom = [
    activeMatches.length > 0 ? QUEUE_TYPE_LABELS.active : null,
    waitingMatches.length > 0 ? QUEUE_TYPE_LABELS.waiting : null,
  ].filter(label => label !== null).join(' и ')

  return {
    nextState: {
      ...prev,
      activeQueue: prev.activeQueue.filter(player => !isTargetPlayer(player)),
      waitingQueue: prev.waitingQueue.filter(player => !isTargetPlayer(player)),
    },
    logMessage: QUEUE_REMOVE_LOG_MESSAGES.REMOVED_FROM_ALL(playerName, removedFrom),
    isError: false,
    playerName,
  }
}

/** Удаляет игрока из всех очередей и возвращает результат операции. */
export const handleRemovePlayerFromAll = ({
  userId,
  username,
  displayedUsername,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
  silentLog = false,
}: HandleRemovePlayerFromAllArgs): RemovePlayerResult => {
  const decision = decideRemoveFromAll({
    prev: getState(),
    userId,
    username,
    displayedUsername,
  })

  setState(decision.nextState)

  const result = toRemovePlayerResult(decision)

  if (!silentLog) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
