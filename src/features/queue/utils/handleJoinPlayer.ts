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
    // 2. Первичная валидация по-актуальному стейту (кулдауны, баны, статус открытия)
    const validationError = validateQueueEntry({
      isQueueOpen,
      userId,
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
    const existsInActive = prev.activeQueue.some(p => p.userId === userId || p.username === username)
    const existsInWaiting = prev.waitingQueue.some(p => p.userId === userId || p.username === username)

    // TODO: написать нормальные сообщения для всех сценариев. и проверить логику этих сценариев (сейчас некоторые сценарии не так описываются в логах)

    // Проверка на дубликаты
    if (!settings.allowMultipleEntries) {
      if (existsInActive || existsInWaiting) {
        finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже находится в очереди`
        return prev
      }
    } else if (existsInActive && !settings.allowPreJoin) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже в активной очереди, предзапись закрыта`
      return prev
    }

    const updatedActive = [...prev.activeQueue]
    const updatedWaiting = [...prev.waitingQueue]

    // А) Вставка в АКТИВНУЮ очередь
    if (updatedActive.length < maxActiveSize && !existsInActive) {
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

    // Б) Вставка в список ОЖИДАЮЩИХ
    if (!settings.allowPreJoin) {
      finalLogMessage = 'Добавление в очередь: Отклонено, активная очередь заполнена, а список ожидающих отключен'
      return prev
    }

    if (!settings.allowMultipleEntries && existsInWaiting) {
      finalLogMessage = `Добавление в очередь: Отклонено, игрок ${displayName} уже в списке ожидающих`
      return prev
    }

    if (settings.allowMultipleEntries
        && prev.waitingQueue.some((p, idx) => (p.userId === userId || p.username === username)
            && idx >= prev.waitingQueue.length - maxActiveSize)) {
      finalLogMessage = `Добавление в очередь: Отклонено,  игрок ${displayName}  уже в активной очереди и списке ожидающих`
      return prev
    }

    if (settings.prioritizeSubscribers && isPrivileged) {
      const firstNonSubIdx = updatedWaiting.findIndex(p => !p.isSubscriber)
      const insertIdx = firstNonSubIdx === -1 ? updatedWaiting.length : firstNonSubIdx
      updatedWaiting.splice(insertIdx, 0, fullPlayer)
    } else {
      updatedWaiting.push(fullPlayer)
    }

    finalLogMessage = `Добавление в очередь: Игрок ${displayName} добавлен в список ожидания.`
    isSuccess = true
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
