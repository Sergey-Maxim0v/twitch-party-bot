import type { Dispatch, SetStateAction } from 'react'
import { QUEUE_TYPES, type QueueState, type QueueType } from '../types'
import { APP_LOG_STATUSES, type AppLogItem, LOG_SOURCE } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleRemovePlayerArgs {
  /** Уникальный ID пользователя на Twitch для удаления */
  userId: string;
  /** Из какой именно очереди нужно удалить игрока */
  targetQueueType: QueueType;
  /** Имя игрока для отображения */
  displayedUsername?: string;
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
 * Хендлер для удаления ПЕРВОЙ НАЙДЕННОЙ записи игрока из КОНКРЕТНОЙ очереди.
 */
export const handleRemovePlayer = ({
  userId,
  targetQueueType,
  displayedUsername,
  source,
  actorUsername,
  rawCommand,
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

  const queueLabel = targetQueueType === QUEUE_TYPES.ACTIVE ? 'активной очереди' : 'списке ожидающих'
  const isTargetActive = targetQueueType === QUEUE_TYPES.ACTIVE

  let logMessageText: string = ''
  let isError = false

  setState(prev => {
    const queueToSearch = isTargetActive ? prev.activeQueue : prev.waitingQueue
    const index = queueToSearch.findIndex(p => p.userId === userId)

    if (index === -1) {
      isError = true
      const nameOrId = displayedUsername || `ID ${userId}`
      logMessageText = `Ошибка удаления: игрок ${nameOrId} не найден в ${queueLabel}.`
      return prev
    }

    const player = queueToSearch[index]
    const targetPlayerName = displayedUsername || player.displayedUsername || player.username
    logMessageText = `Игрок ${targetPlayerName} удален из ${queueLabel}.`

    if (isTargetActive) {
      const updatedActive = [...prev.activeQueue]
      updatedActive.splice(index, 1)
      return { ...prev, activeQueue: updatedActive }
    } else {
      const updatedWaiting = [...prev.waitingQueue]
      updatedWaiting.splice(index, 1)
      return { ...prev, waitingQueue: updatedWaiting }
    }
  })

  setTimeout(() => {
    pushLog({
      message: logMessageText,
      status: isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.SUCCESS,
      source,
      actorUsername,
      rawCommand,
    })
  }, 0)
}
