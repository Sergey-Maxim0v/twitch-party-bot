import type { Dispatch, SetStateAction } from 'react'
import type { QueueState, QueuePlayer, QueuePlayerFormData } from '../types'
import { validateQueueEntry } from './validateQueueEntry'
import { extractGameNickname } from './extractGameNickname'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { QUEUE_JOIN_STATUSES } from '../../../constants/queue.constants.ts'

type JoinQueueResultStatus = typeof QUEUE_JOIN_STATUSES[keyof typeof QUEUE_JOIN_STATUSES]

interface JoinQueueResult {
  status: JoinQueueResultStatus;
}

interface HandleJoinPlayerArgs {
  /** Текущий статус очереди. */
  isQueueOpen: QueueContextValue['isQueueOpen'];
  /** Данные добавляемого игрока. */
  playerData: QueuePlayerFormData;
  /** Источник вызова команды. */
  source: AppLogItem['source'];
  /** Никнейм того, кто добавил игрока. */
  actorUsername: string;
  /** Исходный текст команды. */
  rawCommand?: string;
  /** Время добавления (по умолчанию — текущее). */
  customTimestamp?: number;
  /** Настройки очереди. */
  settings: QueueSettings;
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog']
}

/**
 * Добавляет игрока в активную очередь или список ожидающих.
 * Порядок решения: валидация → активная очередь → проверки дублей и лимитов → список ожидающих.
 *
 * @returns Статус операции: `joined`, `waiting` или `denied`.
 */
export const handleJoinPlayer = ({
  isQueueOpen,
  playerData,
  source,
  actorUsername,
  rawCommand,
  customTimestamp,
  settings,
  setState,
  pushLog,
}: HandleJoinPlayerArgs): JoinQueueResult => {
  const timestamp = customTimestamp || Date.now()
  const userId = playerData.userId
  const username = playerData.username
  const isPrivileged = Boolean(playerData.isSubscriber || playerData.isVip || playerData.isModerator)
  const displayName = playerData.displayedUsername || username

  const extractedNickname = extractGameNickname({
    rawMessage: playerData.rawMessage,
    gameConfig: settings.currentGame,
  })

  const fullPlayer: QueuePlayer = {
    ...playerData,
    timestamp,
    gameNickname: extractedNickname,
    isVip: playerData.isVip ?? false,
    isModerator: playerData.isModerator ?? false,
    isSubscriber: playerData.isSubscriber ?? false,
  }

  let finalLogMessage = ''
  let operationStatus: JoinQueueResult['status'] = QUEUE_JOIN_STATUSES.DENIED

  const insertPlayer = (queue: QueuePlayer[]): void => {
    if (settings.prioritizeSubscribers && isPrivileged) {
      const firstNonSubIdx = queue.findIndex(p => !p.isSubscriber)
      const insertIdx = firstNonSubIdx === -1 ? queue.length : firstNonSubIdx
      queue.splice(insertIdx, 0, fullPlayer)
      return
    }

    queue.push(fullPlayer)
  }

  setState(prev => {
    const validationError = validateQueueEntry({
      isQueueOpen,
      username,
      isPrivileged,
      state: prev,
      settings,
      source,
    })

    if (validationError) {
      finalLogMessage = validationError
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    const maxActiveSize = settings.maxQueueSize || 4
    const isActiveQueueNotFull = prev.activeQueue.length < maxActiveSize
    const existsInActive = prev.activeQueue.some(p => p.userId === userId || p.username === username)
    const existsInWaiting = prev.waitingQueue.some(p => p.userId === userId || p.username === username)

    const updatedActive = [...prev.activeQueue]
    const updatedWaiting = [...prev.waitingQueue]

    if (isActiveQueueNotFull && !existsInActive) {
      insertPlayer(updatedActive)
      finalLogMessage = `Добавление в очередь: Игрок ${displayName} добавлен в активную очередь.`
      operationStatus = QUEUE_JOIN_STATUSES.JOINED
      return { ...prev, activeQueue: updatedActive }
    }

    if (isActiveQueueNotFull && existsInActive && !settings.allowPreJoin) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже в активной очереди, список ожидающих отключен.`
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    if (!isActiveQueueNotFull && !existsInActive && !settings.allowPreJoin) {
      finalLogMessage = 'Добавление в очередь: Отклонено, активная очередь заполнена, а список ожидающих отключен.'
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    if (existsInActive && settings.allowPreJoin && !settings.allowMultipleEntries) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится в активной очереди, повторная запись запрещена.`
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    if (existsInActive && settings.allowPreJoin && settings.allowMultipleEntries && existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится и в активной очереди, и в списке ожидающих.`
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    if (!existsInActive && settings.allowPreJoin && existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится в списке ожидающих.`
      operationStatus = QUEUE_JOIN_STATUSES.DENIED
      return prev
    }

    insertPlayer(updatedWaiting)

    operationStatus = QUEUE_JOIN_STATUSES.WAITING

    if (existsInActive && settings.allowPreJoin && settings.allowMultipleEntries && !existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Игрок ${displayName} уже в активной очереди, добавлен в список ожидания.`
      return { ...prev, waitingQueue: updatedWaiting }
    }

    finalLogMessage = `Добавление в очередь: Игрок ${displayName} добавлен в список ожидания.`
    return { ...prev, waitingQueue: updatedWaiting }
  })

  setTimeout(() => {
    if (operationStatus !== QUEUE_JOIN_STATUSES.DENIED) {
      pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.INFO, source, actorUsername, rawCommand })
      return
    }

    if (finalLogMessage) {
      pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    }
  }, 0)

  return { status: operationStatus }
}
