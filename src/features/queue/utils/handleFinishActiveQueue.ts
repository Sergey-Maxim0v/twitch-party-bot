import type { Dispatch, SetStateAction } from 'react'
import type { QueueSession, QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleFinishActiveQueueArgs {
  /** Источник вызова команды (обычно интерфейс стримера) */
  source: AppLogItem['source'];
  /** Никнейм того, кто инициировал завершение */
  actorUsername: string;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для завершения текущей сессии, её архивации в историю,
 * фиксации кулдаунов участников.
 */
export const handleFinishActiveQueue = ({
  source,
  actorUsername,
  setState,
  pushLog,
}: HandleFinishActiveQueueArgs): void => {
  let playedPlayersCount = 0
  let nextSessionNumber = 1
  let isQueueEmpty = false

  setState(prev => {
    // Если активная очередь пуста, завершать нечего
    if (prev.activeQueue.length === 0) {
      isQueueEmpty = true
      return prev
    }

    playedPlayersCount = prev.activeQueue.length
    const currentTimestamp = Date.now()
    nextSessionNumber = prev.globalSessionCounter + 1

    const updatedPlayerHistory = { ...prev.playerHistory }

    // 1. Фиксируем кулдауны для всех игроков, которые отыграли текущую сессию
    prev.activeQueue.forEach(player => {
      updatedPlayerHistory[player.userId] = {
        lastPlayedTimestamp: currentTimestamp,
        lastPlayedSessionNumber: nextSessionNumber,
      }
    })

    // 2. Создаем объект сессии для отправки в историю
    const finishedSession: QueueSession = {
      id: `session_${currentTimestamp}_${Math.random().toString(36).substring(2, 7)}`,
      name: `Состав №${nextSessionNumber}`,
      createdAt: prev.activeQueue[0]?.timestamp || currentTimestamp,
      playedAt: currentTimestamp,
      players: prev.activeQueue,
    }

    return {
      ...prev,
      activeQueue: [],
      queueHistory: [finishedSession, ...prev.queueHistory],
      globalSessionCounter: nextSessionNumber,
      playerHistory: updatedPlayerHistory,
    }
  })

  setTimeout(() => {
    if (!isQueueEmpty) {
      const logMessage = `Состав №${nextSessionNumber} завершен (игроков: ${playedPlayersCount}).`
      pushLog({ message: logMessage, status: APP_LOG_STATUSES.WARNING, source, actorUsername })
    } else {
      pushLog({
        message: 'Не удалось завершить сессию: активная очередь пуста.',
        status: APP_LOG_STATUSES.ERROR,
        source,
        actorUsername,
      })
    }
  }, 0)
}
