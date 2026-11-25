import { QUEUE_JOIN_STATUSES } from '../../../constants/queue.constants.ts'
import type { JoinDecision, JoinPlayerStateArgs } from '../types.ts'
import { createEmptyJoinDisplaced } from './createEmptyJoinDisplaced.ts'
import { formatJoinLog } from './formatJoinLog.ts'
import { hasQueuePlayer } from './queuePlayers.utils.ts'

interface DecideJoinDisplacementArgs extends JoinPlayerStateArgs {
  firstRegularIndex: number;
  allowPreJoin: boolean;
}

/** Вытеснение простого игрока приоритетным. */
export const decideJoinDisplacement = ({
  prev,
  player,
  firstRegularIndex,
  allowPreJoin,
}: DecideJoinDisplacementArgs): JoinDecision => {
  const activeQueue = [...prev.activeQueue]
  activeQueue.splice(firstRegularIndex, 0, player)
  const displacedPlayer = activeQueue.pop()!
  const displaced = createEmptyJoinDisplaced()

  if (allowPreJoin && hasQueuePlayer(prev.waitingQueue, displacedPlayer)) {
    displaced.displacedAlreadyWaiting.push(displacedPlayer)
  } else if (allowPreJoin) {
    displaced.displacedToWaiting.push(displacedPlayer)
  } else {
    displaced.displacedRemoved.push(displacedPlayer)
  }

  return {
    status: QUEUE_JOIN_STATUSES.JOINED,
    logMessage: formatJoinLog({ name: player.displayedUsername || player.username, ...displaced }),
    nextState: {
      ...prev,
      activeQueue,
      waitingQueue: displaced.displacedToWaiting.length > 0
        ? [...displaced.displacedToWaiting, ...prev.waitingQueue]
        : prev.waitingQueue,
    },
    displaced,
  }
}
