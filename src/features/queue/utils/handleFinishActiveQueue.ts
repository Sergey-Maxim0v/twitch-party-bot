import { QUEUE_SESSION_ID_PREFIX, QUEUE_SESSION_NAME } from '../../../constants/queue.constants.ts'
import { createId } from '../../../utils/createId.ts'
import { getOwnValue } from '../../../utils/objects.ts'
import type {
  PlayerHistoryStats,
  QueuePlayer,
  QueueSession,
  QueueSetState,
  QueueState,
} from '../types'
import { normalizeQueueUsername } from './queuePlayers.utils.ts'
import { limitPlayerHistory, limitQueueHistory } from './queueState.utils.ts'

interface HandleFinishActiveQueueArgs {
  getState: () => QueueState;
  setState: QueueSetState;
}

export interface FinishActiveQueueResult {
  isEmpty: boolean;
  playedPlayers: QueuePlayer[];
  sessionNumber: number;
}

const createFinishedPlayerStats = (
  player: Pick<QueuePlayer, 'userId'>,
  username: string,
  existingStats: PlayerHistoryStats | undefined,
  sessionNumber: number,
  playedAt: number,
): PlayerHistoryStats => ({
  lastPlayedTimestamp: playedAt,
  lastPlayedSessionNumber: sessionNumber,
  gamesPlayed: (existingStats?.gamesPlayed ?? 0) + 1,
  userID: player.userId,
  username,
})

/** Архивирует активный состав в историю и фиксирует кулдауны участников. */
export const handleFinishActiveQueue = ({
  getState,
  setState,
}: HandleFinishActiveQueueArgs): FinishActiveQueueResult => {
  const prev = getState()

  if (prev.activeQueue.length === 0) {
    setState(prev)

    return { isEmpty: true, playedPlayers: [], sessionNumber: prev.globalSessionCounter }
  }

  const playedPlayers = [...prev.activeQueue]
  const sessionNumber = prev.globalSessionCounter + 1
  const playedAt = Date.now()

  // `fromEntries` создаёт обычное поле даже для ника `__proto__`, а присваивание по ключу меняет прототип.
  const finishedStats = Object.fromEntries(
    playedPlayers.map(player => {
      const username = normalizeQueueUsername(player.username)

      return [
        username,
        createFinishedPlayerStats(
          player,
          username,
          getOwnValue(prev.playerHistory, username),
          sessionNumber,
          playedAt,
        ),
      ] as const
    }),
  )

  const finishedSession: QueueSession = {
    id: createId(QUEUE_SESSION_ID_PREFIX),
    name: QUEUE_SESSION_NAME(sessionNumber),
    createdAt: playedPlayers[0]?.timestamp || playedAt,
    playedAt,
    players: playedPlayers,
  }

  setState({
    ...prev,
    activeQueue: [],
    queueHistory: limitQueueHistory([finishedSession, ...prev.queueHistory]),
    globalSessionCounter: sessionNumber,
    playerHistory: limitPlayerHistory({ ...prev.playerHistory, ...finishedStats }),
  })

  return { isEmpty: false, playedPlayers, sessionNumber }
}
