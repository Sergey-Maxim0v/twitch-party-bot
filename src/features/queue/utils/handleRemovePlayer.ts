import type { Dispatch, SetStateAction } from 'react'
import { QUEUE_TYPES, type QueueState, type QueueType } from '../types'
import { APP_LOG_STATUSES, type AppLogItem, LOG_SOURCE } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerArgs {
  /** Уникальный ID пользователя на Twitch для удаления */
  userId: string;
  /** Из какой именно очереди нужно удалить игрока */
  targetQueueType: QueueType;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил удаление */
  actorUsername: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
  /** Текущее состояние очереди (передаем как значение) */
  state: QueueState;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для удаления ПЕРВОЙ НАЙДЕННОЙ записи игрока из КОНКРЕТНОЙ очереди.
 */
export const handleRemovePlayer = ({
  userId,
  targetQueueType,
  source,
  actorUsername,
  rawCommand,
  state,
  setState,
  pushLog,
}: HandleRemovePlayerArgs): void => {
  if (targetQueueType === QUEUE_TYPES.HISTORY) {
    pushLog({
      message: 'Ошибка: из истории нельзя удалить игрока',
      source: LOG_SOURCE.APPLICATION,
      status: APP_LOG_STATUSES.ERROR,
      actorUsername,
    })
    return
  }

  const queueLabel = targetQueueType === QUEUE_TYPES.ACTIVE ? 'активной очереди' : 'будущей очереди'
  const isTargetActive = targetQueueType === QUEUE_TYPES.ACTIVE
  const queueToSearch = isTargetActive ? state.activeQueue : state.futureQueue

  const index = queueToSearch.findIndex(p => p.userId === userId)

  if (index === -1) {
    const logMessage = `Ошибка удаления: игрок с ID ${userId} не найден в ${queueLabel}.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    return
  }

  const player = queueToSearch[index]
  const targetPlayerName = player.displayedUsername || player.username
  const logMessage = `Игрок ${targetPlayerName} удален из ${queueLabel}.`

  if (isTargetActive) {
    const updatedActive = [...state.activeQueue]
    updatedActive.splice(index, 1)
    setState({ ...state, activeQueue: updatedActive })
  } else {
    const updatedFuture = [...state.futureQueue]
    updatedFuture.splice(index, 1)
    setState({ ...state, futureQueue: updatedFuture })
  }

  pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
}
