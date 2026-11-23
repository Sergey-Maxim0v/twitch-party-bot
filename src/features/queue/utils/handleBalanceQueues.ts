import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import { decideBalance, type QueueBalanceArgs } from './queueBalanceDecision.ts'

const notifyPlayers = (usernames: string[], callback?: (usernames: string[]) => void): void => {
  if (usernames.length > 0) callback?.(usernames)
}

export const handleBalanceQueues = ({
  maxQueueSize,
  moveOnSizeChange,
  allowPreJoin,
  prioritizeSubscribers,
  subscribersOnly,
  cooldowns,
  source,
  actorUsername,
  getState,
  setState,
  pushLog,
  onPlayersMovedToActive,
  onPlayersMovedToWaiting,
  onPlayersRemoved,
}: QueueBalanceArgs): void => {
  const decision = decideBalance({
    prev: getState(),
    maxQueueSize,
    moveOnSizeChange,
    allowPreJoin,
    prioritizeSubscribers,
    subscribersOnly,
    cooldowns,
  })

  setState(decision.nextState)

  if (decision.logMessage) {
    pushLog({
      message: decision.logMessage,
      status: APP_LOG_STATUSES.INFO,
      source,
      actorUsername,
    })
  }

  notifyPlayers(decision.movedToActive, onPlayersMovedToActive)
  notifyPlayers(decision.movedToWaiting, onPlayersMovedToWaiting)
  notifyPlayers(decision.removedPlayers, onPlayersRemoved)
}
