import { QUEUE_REMOVE_LOG_MESSAGES, QUEUE_TYPE_LABELS } from '../../../constants/queue.constants.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import type { QueueHandlerArgs, QueuePlayer } from '../types.ts'
import { isSameQueuePlayer } from './queuePlayers.utils.ts'
import {
  resolvePlayerName,
  toRemovePlayerResult,
  type RemoveDecision,
  type RemovePlayerResult,
} from './removePlayerResult.ts'

type HandleRemovePlayerFromAllArgs = QueueHandlerArgs & Pick<
  Parameters<QueueContextValue['removePlayerFromAllQueues']>[0],
  'userId' | 'username' | 'displayedUsername'
>

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
  const prev = getState()
  const target = { userId, username }
  const isTargetPlayer = (player: QueuePlayer): boolean => isSameQueuePlayer(target, player)

  const activeMatches = prev.activeQueue.filter(isTargetPlayer)
  const waitingMatches = prev.waitingQueue.filter(isTargetPlayer)

  let decision: RemoveDecision

  if (activeMatches.length === 0 && waitingMatches.length === 0) {
    const playerName = resolvePlayerName({ displayedUsername, username, userId })

    decision = {
      nextState: prev,
      logMessage: QUEUE_REMOVE_LOG_MESSAGES.NOT_FOUND_ANYWHERE(playerName),
      isError: true,
      playerName,
    }
  } else {
    const foundPlayer = activeMatches[0] ?? waitingMatches[0]
    const playerName = resolvePlayerName({ displayedUsername, username, player: foundPlayer })
    const removedFrom = [
      activeMatches.length > 0 ? QUEUE_TYPE_LABELS.active : null,
      waitingMatches.length > 0 ? QUEUE_TYPE_LABELS.waiting : null,
    ].filter(label => label !== null).join(QUEUE_REMOVE_LOG_MESSAGES.QUEUE_TYPES_SEPARATOR)

    decision = {
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
