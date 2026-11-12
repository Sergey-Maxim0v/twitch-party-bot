import type { Dispatch, SetStateAction } from 'react'
import type { QueueSession, QueueState, QueuePlayer } from '../types'
import { limitQueueHistory } from './limitQueueHistory.ts'
import { limitPlayerHistory } from './limitPlayerHistory.ts'
import { createId } from '../../../utils/createId.ts'

interface HandleFinishActiveQueueArgs {
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Колбэк при успешном завершении сессии */
  onSuccess: (playedPlayers: QueuePlayer[], sessionNumber: number) => void;
  /** Колбэк, если активная очередь оказалась пуста */
  onEmpty: () => void;
}

/** Решение по завершению сессии: новое состояние и сыгравший состав. */
interface FinishDecision {
  /** Состояние очереди после завершения сессии. */
  nextState: QueueState;
  /** Игроки завершённого состава. */
  playedPlayers: QueuePlayer[];
  /** Номер завершённой сессии. */
  sessionNumber: number;
  /** Была ли активная очередь пуста. */
  isEmpty: boolean;
}

/**
 * Рассчитывает результат завершения текущей сессии: архивирует состав
 * в историю и фиксирует кулдауны участников.
 *
 * @param prev - Состояние очереди до завершения сессии.
 * @returns Новое состояние очереди и сыгравший состав.
 */
const decideFinish = (prev: QueueState): FinishDecision => {
  if (prev.activeQueue.length === 0) {
    return { nextState: prev, playedPlayers: [], sessionNumber: prev.globalSessionCounter, isEmpty: true }
  }

  const playedPlayers = [...prev.activeQueue]
  const sessionNumber = prev.globalSessionCounter + 1
  const playedAt = Date.now()
  const playerHistory = { ...prev.playerHistory }

  playedPlayers.forEach(player => {
    const existingStats = prev.playerHistory[player.username]

    playerHistory[player.username] = {
      lastPlayedTimestamp: playedAt,
      lastPlayedSessionNumber: sessionNumber,
      gamesPlayed: (existingStats?.gamesPlayed || 0) + 1,
      userID: player.userId,
      username: player.username,
    }
  })

  const finishedSession: QueueSession = {
    id: createId('session'),
    name: `Состав №${sessionNumber}`,
    createdAt: playedPlayers[0]?.timestamp || playedAt,
    playedAt,
    players: playedPlayers,
  }

  return {
    nextState: {
      ...prev,
      activeQueue: [],
      queueHistory: limitQueueHistory([finishedSession, ...prev.queueHistory]),
      globalSessionCounter: sessionNumber,
      playerHistory: limitPlayerHistory(playerHistory),
    },
    playedPlayers,
    sessionNumber,
    isEmpty: false,
  }
}

/**
 * Завершает текущую сессию: архивирует состав в историю (не более
 * `QUEUE_HISTORY_LIMIT` записей) и фиксирует кулдауны участников.
 */
export const handleFinishActiveQueue = ({
  getState,
  setState,
  onSuccess,
  onEmpty,
}: HandleFinishActiveQueueArgs): void => {
  const decision = decideFinish(getState())

  setState(decision.nextState)

  if (decision.isEmpty) {
    onEmpty()
    return
  }

  onSuccess(decision.playedPlayers, decision.sessionNumber)
}
