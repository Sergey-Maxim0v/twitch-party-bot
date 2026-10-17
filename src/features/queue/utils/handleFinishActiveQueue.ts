import type { Dispatch, SetStateAction } from 'react'
import type { QueuePlayer, QueueSession, QueueState } from '../types'

export interface HandleFinishActiveQueueArgs {
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Колбэк при успешном завершении сессии */
  onSuccess: (playedPlayers: QueuePlayer[], sessionNumber: number) => void;
  /** Колбэк, если активная очередь оказалась пуста */
  onEmpty: () => void;
}

/**
 * Хендлер для завершения текущей сессии, её архивации в историю,
 * фиксации кулдаунов участников.
 */
export const handleFinishActiveQueue = ({
  setState,
  onSuccess,
  onEmpty,
}: HandleFinishActiveQueueArgs): void => {
  setState(prev => {
    // Если активная очередь пуста, завершать нечего
    if (prev.activeQueue.length === 0) {
      onEmpty()
      return prev
    }

    const playedPlayers = [...prev.activeQueue]
    const currentTimestamp = Date.now()
    const nextSessionNumber = prev.globalSessionCounter + 1

    const updatedPlayerHistory = { ...prev.playerHistory }

    // 1. Фиксируем кулдауны для всех игроков, которые отыграли текущую сессию
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

    // 2. Создаем объект сессии для отправки в историю
    const finishedSession: QueueSession = {
      id: `session_${currentTimestamp}_${Math.random().toString(36).substring(2, 7)}`,
      name: `Состав №${nextSessionNumber}`,
      createdAt: playedPlayers[0]?.timestamp || currentTimestamp,
      playedAt: currentTimestamp,
      players: playedPlayers,
    }

    // Вызываем успешный колбэк с данными
    onSuccess(playedPlayers, nextSessionNumber)

    return {
      ...prev,
      activeQueue: [],
      queueHistory: [finishedSession, ...prev.queueHistory],
      globalSessionCounter: nextSessionNumber,
      playerHistory: updatedPlayerHistory,
    }
  })
}
