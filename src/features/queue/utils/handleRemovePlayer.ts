import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerArgs {
  /** Уникальный ID пользователя на Twitch для удаления */
  userId: string;
  /** Из какой именно очереди нужно удалить игрока */
  targetQueueType: 'active' | 'future';
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил удаление */
  actorUsername: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для удаления ПЕРВОЙ НАЙДЕННОЙ записи игрока из КОНКРЕТНОЙ очереди (активной или будущей).
 */
export const handleRemovePlayer = ({
  userId,
  targetQueueType,
  source,
  actorUsername,
  rawCommand,
  setState,
  pushLog,
}: HandleRemovePlayerArgs): void => {
  let targetPlayerName = ''
  let isRemoved = false

  setState(prev => {
    const isTargetActive = targetQueueType === 'active'
    const queueToSearch = isTargetActive ? prev.activeQueue : prev.futureQueue

    const index = queueToSearch.findIndex(p => p.userId === userId)

    if (index === -1) return prev // Если в целевой очереди нет игрока, стейт не меняем

    targetPlayerName = queueToSearch[index].displayedUsername || queueToSearch[index].username
    isRemoved = true

    if (isTargetActive) {
      const updatedActive = [...prev.activeQueue]
      updatedActive.splice(index, 1)
      return { ...prev, activeQueue: updatedActive }
    } else {
      const updatedFuture = [...prev.futureQueue]
      updatedFuture.splice(index, 1)
      return { ...prev, futureQueue: updatedFuture }
    }
  })

  const queueLabel = targetQueueType === 'active' ? 'активной очереди' : 'будущей очереди'

  if (isRemoved) {
    const logMessage = `Игрок ${targetPlayerName} удален из ${queueLabel}.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
  } else {
    const logMessage = `Ошибка удаления: игрок с ID ${userId} не найден в ${queueLabel}.`
    pushLog({ message: logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
  }
}
