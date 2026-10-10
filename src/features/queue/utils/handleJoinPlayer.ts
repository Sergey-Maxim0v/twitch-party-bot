import type { Dispatch, SetStateAction } from 'react'
import type { QueueState, QueuePlayer, QueuePlayerFormData } from '../types'
import { validateQueueEntry } from './validateQueueEntry'
import { extractGameNickname } from './extractGameNickname'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'

export interface HandleJoinPlayerArgs {
  isQueueOpen: QueueContextValue['isQueueOpen'];
  playerData: QueuePlayerFormData;
  source: AppLogItem['source'];
  actorUsername: string;
  rawCommand?: string;
  customTimestamp?: number;
  settings: QueueSettings;
  setState: Dispatch<SetStateAction<QueueState>>;
  pushLog: AppLogsContextValue['pushLog']
}

/**
 * Хендлер для добавления игрока в активную очередь или список ожидающих со всеми бизнес-проверками.
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
}: HandleJoinPlayerArgs): void => {
  const timestamp = customTimestamp || Date.now()
  const userId = playerData.userId
  const username = playerData.username
  const isPrivileged = Boolean(playerData.isSubscriber || playerData.isVip || playerData.isModerator)
  const displayName = playerData.displayedUsername || username

  // 1. Извлечение игрового никнейма
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
  let isSuccess = false

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
      return prev
    }

    const maxActiveSize = settings.maxQueueSize || 4
    const isActiveQueueNotFull = prev.activeQueue.length < maxActiveSize
    const existsInActive = prev.activeQueue.some(p => p.userId === userId || p.username === username)
    const existsInWaiting = prev.waitingQueue.some(p => p.userId === userId || p.username === username)

    const updatedActive = [...prev.activeQueue]
    const updatedWaiting = [...prev.waitingQueue]

    // Есть место в активной очереди, игрока там еще нет -> Добавляем в активную
    if (isActiveQueueNotFull && !existsInActive) {
      if (settings.prioritizeSubscribers && isPrivileged) {
        const firstNonSubIdx = updatedActive.findIndex(p => !p.isSubscriber)
        const insertIdx = firstNonSubIdx === -1 ? updatedActive.length : firstNonSubIdx
        updatedActive.splice(insertIdx, 0, fullPlayer)
      } else {
        updatedActive.push(fullPlayer)
      }
      finalLogMessage = `Добавление в очередь: Игрок ${displayName} добавлен в активную очередь.`
      isSuccess = true
      return { ...prev, activeQueue: updatedActive }
    }

    // Есть место в активной, игрок уже там, а список ожидающих отключен -> Отклонено
    if (isActiveQueueNotFull && existsInActive && !settings.allowPreJoin) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже в активной очереди, список ожидающих отключен.`
      return prev
    }

    // Активная очередь полна, игрока там нет, а список ожидающих отключен -> Отклонено
    if (!isActiveQueueNotFull && !existsInActive && !settings.allowPreJoin) {
      finalLogMessage = 'Добавление в очередь: Отклонено, активная очередь заполнена, а список ожидающих отключен.'
      return prev
    }

    // Игрок уже в активной, список ожидающих включен, но повторная запись запрещена -> Отклонено
    if (existsInActive && settings.allowPreJoin && !settings.allowMultipleEntries) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится в активной очереди, повторная запись запрещена.`
      return prev
    }

    // Игрок уже и в активной очереди и в списке ожидающих -> Отклонено
    if (existsInActive && settings.allowPreJoin && settings.allowMultipleEntries && existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится и в активной очереди, и в списке ожидающих.`
      return prev
    }

    // Игрока нет в активной, он уже находится в списке ожидающих (дубликат записи в вейтинг) -> Отклонено
    if (!existsInActive && settings.allowPreJoin && existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится в списке ожидающих.`
      return prev
    }

    // Добавление в список ожидающих для оставшихся успешных сценариев
    if (settings.prioritizeSubscribers && isPrivileged) {
      const firstNonSubIdx = updatedWaiting.findIndex(p => !p.isSubscriber)
      const insertIdx = firstNonSubIdx === -1 ? updatedWaiting.length : firstNonSubIdx
      updatedWaiting.splice(insertIdx, 0, fullPlayer)
    } else {
      updatedWaiting.push(fullPlayer)
    }

    isSuccess = true

    // Игрок уже в активной очереди, но разрешена мульти-запись -> Добавлен в список ожидания
    if (existsInActive && settings.allowPreJoin && settings.allowMultipleEntries && !existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Игрок ${displayName} уже в активной очереди, добавлен в список ожидания.`
      return { ...prev, waitingQueue: updatedWaiting }
    }

    // Нового игрока нет нигде, активная полна, список ожидающих включен -> Добавлен в список ожидания
    finalLogMessage = `Добавление в очередь: Игрок ${displayName} добавлен в список ожидания.`
    return { ...prev, waitingQueue: updatedWaiting }
  })

  setTimeout(() => {
    if (isSuccess) {
      pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.INFO, source, actorUsername, rawCommand })
    } else if (finalLogMessage) {
      pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    }
  }, 0)
}
