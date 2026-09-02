import type { Dispatch, SetStateAction } from 'react'
import type { QueueState, QueuePlayer, QueuePlayerFormData } from '../types'
import { validateQueueEntry } from './validateQueueEntry'
import { extractGameNickname } from './extractGameNickname'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleJoinPlayerArgs {
  playerData: QueuePlayerFormData;
  source: AppLogItem['source'];
  actorUsername: string;
  rawCommand?: string;
  customTimestamp?: number;
  state: QueueState;
  settings: QueueSettings;
  setState: Dispatch<SetStateAction<QueueState>>;
  pushLog: AppLogsContextValue['pushLog']
}

/**
 * Хендлер для добавления игрока в активную или будущую очередь со всеми бизнес-проверками.
 */
export const handleJoinPlayer = ({
  playerData,
  source,
  actorUsername,
  rawCommand,
  customTimestamp,
  state,
  settings,
  setState,
  pushLog,
}: HandleJoinPlayerArgs): void => {
  const timestamp = customTimestamp || Date.now()
  const userId = playerData.userId
  const username = playerData.username
  const isPrivileged = Boolean(playerData.isSubscriber || playerData.isVip || playerData.isModerator)
  const displayName = playerData.displayedUsername || username

  // 1. Запуск валидации ограничений (кулдауны, бан-листы, открыта ли очередь)
  const validationError = validateQueueEntry({ userId, username, isPrivileged, state, settings, source })
  if (validationError) {
    pushLog({ message: validationError, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    return
  }

  // 2. Извлечение игрового никнейма
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
    const maxActiveSize = settings.maxQueueSize || 4
    const existsInActive = prev.activeQueue.some(p => p.userId === userId)
    const existsInFuture = prev.futureQueue.some(p => p.userId === userId)

    // Проверка на дубликаты
    if (!settings.allowMultipleEntries) {
      if (existsInActive || existsInFuture) {
        finalLogMessage = `Отклонено: игрок ${displayName} уже находится в очереди`
        return prev
      }
    } else if (existsInActive && !settings.allowPreJoin) {
      finalLogMessage = `Отклонено: игрок ${displayName} уже в активной очереди, предзапись закрыта`
      return prev
    }

    const updatedActive = [...prev.activeQueue]
    const updatedFuture = [...prev.futureQueue]

    // А) Вставка в АКТИВНУЮ очередь
    if (updatedActive.length < maxActiveSize && !existsInActive) {
      if (settings.prioritizeSubscribers && isPrivileged) {
        const firstNonSubIdx = updatedActive.findIndex(p => !p.isSubscriber)
        const insertIdx = firstNonSubIdx === -1 ? updatedActive.length : firstNonSubIdx
        updatedActive.splice(insertIdx, 0, fullPlayer)
      } else {
        updatedActive.push(fullPlayer)
      }
      finalLogMessage = `Игрок ${displayName} добавлен в активную очередь.`
      isSuccess = true
      return { ...prev, activeQueue: updatedActive }
    }

    // Б) Вставка в БУДУЩУЮ очередь
    if (!settings.allowPreJoin) {
      finalLogMessage = 'Отклонено: активная очередь заполнена, а будущие очереди отключены'
      return prev
    }

    if (!settings.allowMultipleEntries && existsInFuture) {
      finalLogMessage = `Отклонено: игрок ${displayName} уже ожидает в будущей очереди`
      return prev
    }

    if (settings.allowMultipleEntries && prev.futureQueue.some((p, idx) => p.userId === userId && idx >= prev.futureQueue.length - maxActiveSize)) {
      finalLogMessage = 'Отклонено: нельзя записаться несколько раз подряд в один состав'
      return prev
    }

    if (settings.prioritizeSubscribers && isPrivileged) {
      const firstNonSubIdx = updatedFuture.findIndex(p => !p.isSubscriber)
      const insertIdx = firstNonSubIdx === -1 ? updatedFuture.length : firstNonSubIdx
      updatedFuture.splice(insertIdx, 0, fullPlayer)
    } else {
      updatedFuture.push(fullPlayer)
    }

    finalLogMessage = `Игрок ${displayName} добавлен в лист ожидания (будущую очередь).`
    isSuccess = true
    return { ...prev, futureQueue: updatedFuture }
  })

  if (isSuccess) {
    pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.SUCCESS, source, actorUsername, rawCommand })
  } else if (finalLogMessage) {
    pushLog({ message: finalLogMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
  }
}
