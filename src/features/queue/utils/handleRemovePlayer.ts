import { QUEUE_TYPES, type QueueHandlerArgs, type QueueType } from '../types'
import { APP_LOG_STATUSES, APP_LOG_SOURCES } from '../../app-logs/types.ts'
import { QUEUE_TYPE_LABELS_LOCATIVE } from '../../../constants/queue.constants.ts'

interface HandleRemovePlayerArgs extends QueueHandlerArgs {
  /** Уникальный ID пользователя на Twitch для удаления */
  userId: string;
  /** Из какой именно очереди нужно удалить игрока */
  targetQueueType: QueueType;
  /** Имя игрока для отображения */
  displayedUsername?: string;
  /** Исходный текст команды (если вызвано из чата) */
  rawCommand?: string;
}

/**
 * Удаляет первую найденную запись игрока из указанной очереди.
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
      message: 'Удаление из очереди: Ошибка, из истории нельзя удалить игрока',
      source: APP_LOG_SOURCES.APPLICATION,
      status: APP_LOG_STATUSES.ERROR,
      actorUsername,
    })
    return
  }

  const queueLabel = targetQueueType === QUEUE_TYPES.ACTIVE
    ? QUEUE_TYPE_LABELS_LOCATIVE.active
    : QUEUE_TYPE_LABELS_LOCATIVE.waiting
  const isTargetActive = targetQueueType === QUEUE_TYPES.ACTIVE

  let logMessageText: string = ''
  let isError = false

  setState(prev => {
    const queueToSearch = isTargetActive ? prev.activeQueue : prev.waitingQueue
    const index = queueToSearch.findIndex(p => p.userId === userId)

    if (index === -1) {
      isError = true
      const nameOrId = displayedUsername || `ID ${userId}`
      logMessageText = `Удаление из очереди: Ошибка, игрок ${nameOrId} не найден в ${queueLabel}.`
      return prev
    }

    const player = queueToSearch[index]
    const targetPlayerName = displayedUsername || player.displayedUsername || player.username
    logMessageText = `Удаление из очереди: ${targetPlayerName} удален из ${queueLabel}.`

    if (isTargetActive) {
      const updatedActive = [...prev.activeQueue]
      updatedActive.splice(index, 1)
      return { ...prev, activeQueue: updatedActive }
    }

    const updatedWaiting = [...prev.waitingQueue]
    updatedWaiting.splice(index, 1)
    return { ...prev, waitingQueue: updatedWaiting }
  })

  setTimeout(() => {
    pushLog({
      message: logMessageText,
      status: isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
      source,
      actorUsername,
      rawCommand,
    })
  }, 0)
}
