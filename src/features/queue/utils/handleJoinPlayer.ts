import type { Dispatch, SetStateAction } from 'react'
import type { QueueJoinResult, QueueJoinStatus, QueuePlayer, QueuePlayerFormData, QueueState } from '../types'
import { validateQueueEntry } from './validateQueueEntry'
import { extractGameNickname } from './extractGameNickname'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import {
  DEFAULT_QUEUE_SETTINGS,
  QUEUE_JOIN_LOG_MESSAGES,
  QUEUE_JOIN_STATUSES,
} from '../../../constants/queue.constants.ts'
import { hasQueuePlayer } from './hasQueuePlayer.ts'
import { isPrivilegedPlayer } from './isPrivilegedPlayer.ts'

interface HandleJoinPlayerArgs {
  /** Текущий статус очереди. */
  isQueueOpen: QueueContextValue['isQueueOpen'];
  /** Данные добавляемого игрока. */
  playerData: QueuePlayerFormData;
  /** Источник вызова команды. */
  source: AppLogItem['source'];
  /** Никнейм того, кто добавил игрока. */
  actorUsername: string;
  /** Время добавления (по умолчанию — текущее). */
  customTimestamp?: number;
  /** Настройки очереди. */
  settings: QueueSettings;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog'];
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
}

/** Решение по заявке игрока. */
interface JoinDecision {
  /** Итоговый статус операции. */
  status: QueueJoinStatus;
  /** Текст записи в журнале приложения. */
  logMessage: string;
  /** Состояние очереди после операции. */
  nextState: QueueState;
}

/** Аргументы расчёта решения по заявке игрока. */
interface DecideJoinArgs {
  /** Состояние очереди до операции. */
  prev: QueueState;
  /** Добавляемый игрок. */
  player: QueuePlayer;
  /** Текущий статус очереди. */
  isQueueOpen: QueueContextValue['isQueueOpen'];
  /** Настройки очереди. */
  settings: QueueSettings;
  /** Источник вызова команды. */
  source: AppLogItem['source'];
}

/**
 * Добавляет игрока в список с учётом приоритета подписчиков.
 *
 * @returns Новый список игроков.
 */
const insertPlayer = (queue: QueuePlayer[], player: QueuePlayer, prioritize: boolean): QueuePlayer[] => {
  if (!prioritize) return [...queue, player]

  const firstRegularIndex = queue.findIndex(p => !isPrivilegedPlayer(p))
  const insertIndex = firstRegularIndex === -1 ? queue.length : firstRegularIndex

  return [...queue.slice(0, insertIndex), player, ...queue.slice(insertIndex)]
}

/** Формирует отказ по заявке без изменения состояния очереди. */
const denyJoin = (prev: QueueState, logMessage: string): JoinDecision => ({
  status: QUEUE_JOIN_STATUSES.DENIED,
  logMessage,
  nextState: prev,
})

/**
 * Рассчитывает результат заявки игрока по правилам очереди.
 *
 * @returns Статус операции, текст журнала и состояние очереди после операции.
 */
const decideJoin = ({
  prev,
  player,
  isQueueOpen,
  settings,
  source,
}: DecideJoinArgs): JoinDecision => {
  const isPrivileged = isPrivilegedPlayer(player)
  const validationError = validateQueueEntry({
    isQueueOpen,
    username: player.username,
    isPrivileged,
    state: prev,
    settings,
    source,
  })

  if (validationError) return denyJoin(prev, validationError)

  const displayName = player.displayedUsername || player.username
  const maxActiveSize = settings.maxQueueSize || DEFAULT_QUEUE_SETTINGS.maxQueueSize
  const isActiveQueueNotFull = prev.activeQueue.length < maxActiveSize
  const isPrioritized = Boolean(settings.prioritizeSubscribers) && isPrivileged
  const isInActive = hasQueuePlayer(prev.activeQueue, player)
  const isInWaiting = hasQueuePlayer(prev.waitingQueue, player)

  if (!isInActive && isActiveQueueNotFull) {
    return {
      status: QUEUE_JOIN_STATUSES.JOINED,
      logMessage: QUEUE_JOIN_LOG_MESSAGES.ACTIVE(displayName),
      nextState: {
        ...prev,
        activeQueue: insertPlayer(prev.activeQueue, player, isPrioritized),
      },
    }
  }

  // Полная очередь: приоритетный игрок встаёт перед первым простым, очередь сдвигается, а последний игрок уходит в список ожидания.
  const firstRegularIndex = !isInActive && !isInWaiting && !isActiveQueueNotFull && isPrioritized
    ? prev.activeQueue.findIndex(queuePlayer => !isPrivilegedPlayer(queuePlayer))
    : -1

  if (firstRegularIndex !== -1) {
    const activeQueue = [...prev.activeQueue]
    activeQueue.splice(firstRegularIndex, 0, player)
    const displaced = activeQueue.pop()!
    const canWait = settings.allowPreJoin && !hasQueuePlayer(prev.waitingQueue, displaced)
    const waitingQueue = canWait ? [displaced, ...prev.waitingQueue] : prev.waitingQueue

    return {
      status: QUEUE_JOIN_STATUSES.JOINED,
      logMessage: QUEUE_JOIN_LOG_MESSAGES.ACTIVE(displayName),
      nextState: { ...prev, activeQueue, waitingQueue },
    }
  }

  if (!settings.allowPreJoin) {
    return denyJoin(prev, isInActive
      ? QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE(displayName)
      : QUEUE_JOIN_LOG_MESSAGES.DENIED_FULL())
  }

  if (isInActive && !settings.allowMultipleEntries) {
    return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_REJOIN(displayName))
  }

  if (isInActive && isInWaiting) {
    return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_ACTIVE_AND_WAITING(displayName))
  }

  if (!isInActive && isInWaiting) {
    return denyJoin(prev, QUEUE_JOIN_LOG_MESSAGES.DENIED_WAITING(displayName))
  }

  return {
    status: QUEUE_JOIN_STATUSES.WAITING,
    logMessage: isInActive
      ? QUEUE_JOIN_LOG_MESSAGES.PREJOIN(displayName)
      : QUEUE_JOIN_LOG_MESSAGES.WAITING(displayName),
    nextState: {
      ...prev,
      waitingQueue: insertPlayer(prev.waitingQueue, player, isPrioritized),
    },
  }
}

/**
 * Добавляет игрока в активную очередь или список ожидающих.
 *
 * @returns Статус операции и данные для журнала приложения.
 */
export const handleJoinPlayer = ({
  isQueueOpen,
  playerData,
  source,
  actorUsername,
  customTimestamp,
  settings,
  getState,
  setState,
  pushLog,
  silentLog = false,
}: HandleJoinPlayerArgs): QueueJoinResult => {
  const player: QueuePlayer = {
    ...playerData,
    timestamp: customTimestamp || Date.now(),
    gameNickname: extractGameNickname({
      rawMessage: playerData.rawMessage,
      gameConfig: settings.currentGame,
      commandNames: Object.values(settings.commands).map(command => command.name),
    }),
    isVip: playerData.isVip ?? false,
    isModerator: playerData.isModerator ?? false,
    isSubscriber: playerData.isSubscriber ?? false,
  }

  const decision = decideJoin({
    prev: getState(),
    player,
    isQueueOpen,
    settings,
    source,
  })

  setState(decision.nextState)

  const result: QueueJoinResult = {
    status: decision.status,
    message: decision.logMessage,
    logStatus: decision.status === QUEUE_JOIN_STATUSES.DENIED ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
  }

  if (!silentLog) {
    pushLog({
      message: result.message,
      status: result.logStatus,
      source,
      actorUsername,
    })
  }

  return result
}
