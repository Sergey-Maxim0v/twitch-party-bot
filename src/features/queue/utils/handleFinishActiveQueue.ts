import type { Dispatch, SetStateAction } from 'react'
import type { QueueSession, QueueState, QueuePlayer } from '../types'
import { limitQueueHistory } from './limitQueueHistory.ts'
import { limitPlayerHistory } from './limitPlayerHistory.ts'

interface HandleFinishActiveQueueArgs {
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Колбэк при успешном завершении сессии */
  onSuccess: (playedPlayers: QueuePlayer[], sessionNumber: number) => void;
  /** Колбэк, если активная очередь оказалась пуста */
  onEmpty: () => void;
}

/**
 * Завершает текущую сессию: архивирует состав в историю (не более
 * `QUEUE_HISTORY_LIMIT` записей) и фиксирует кулдауны участников.
 */
export const handleFinishActiveQueue = ({
  setState,
  onSuccess,
  onEmpty,
}: HandleFinishActiveQueueArgs): void => {
  let playedPlayers: QueuePlayer[] = []
  let nextSessionNumber = 1
  let isEmpty = false

  setState(prev => {
    if (prev.activeQueue.length === 0) {
      isEmpty = true
      return prev
    }

    playedPlayers = [...prev.activeQueue]
    const currentTimestamp = Date.now()
    nextSessionNumber = prev.globalSessionCounter + 1

    const updatedPlayerHistory = { ...prev.playerHistory }

    playedPlayers.forEach(player => {
      const existingStats = prev.playerHistory[player.username]
      const currentGamesPlayed = existingStats?.gamesPlayed || 0

      updatedPlayerHistory[player.username] = {
        lastPlayedTimestamp: currentTimestamp,
        lastPlayedSessionNumber: nextSessionNumber,
        gamesPlayed: currentGamesPlayed + 1,
        userID: player.userId,
        username: player.username,
      }
    })

    const finishedSession: QueueSession = {
      id: `session_${currentTimestamp}_${Math.random().toString(36).substring(2, 7)}`,
      name: `Состав №${nextSessionNumber}`,
      createdAt: playedPlayers[0]?.timestamp || currentTimestamp,
      playedAt: currentTimestamp,
      players: playedPlayers,
    }

    return {
      ...prev,
      activeQueue: [],
      queueHistory: limitQueueHistory([finishedSession, ...prev.queueHistory]),
      globalSessionCounter: nextSessionNumber,
      playerHistory: limitPlayerHistory(updatedPlayerHistory),
    }
  })

  // Колбэки вызываются после планирования обновления состояния.
  if (isEmpty) {
    onEmpty()
  } else {
    onSuccess(playedPlayers, nextSessionNumber)
  }
}
