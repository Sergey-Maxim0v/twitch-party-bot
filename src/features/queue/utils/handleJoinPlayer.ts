import type { Dispatch, SetStateAction } from 'react'
import type { QueueState, QueuePlayer, QueuePlayerFormData } from '../types'
import { validateQueueEntry } from './validateQueueEntry'
import { extractGameNickname } from './extractGameNickname'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { DEFAULT_QUEUE_SETTINGS, QUEUE_JOIN_STATUSES, QUEUE_LOG_PREFIXES } from '../../../constants/queue.constants.ts'
import { normalizeQueueUsername } from './queuePlayerIdentity.ts'

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
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog']
}

/** Решение по заявке игрока: статус операции, текст журнала и новое состояние. */
interface JoinDecision {
  /** Итоговый статус операции. */
  status: JoinQueueResultStatus;
  /** Текст для журнала приложения. */
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
  /** Признак привилегированного участника (подписчик, VIP или модератор). */
  isPrivileged: boolean;
  /** Текущий статус очереди. */
  isQueueOpen: QueueContextValue['isQueueOpen'];
  /** Настройки очереди. */
  settings: QueueSettings;
  /** Источник вызова команды. */
  source: AppLogItem['source'];
}

/**
 * Вставляет игрока в список, при приоритете подписчиков — перед первым
 * неподписчиком.
 *
 * @param queue - Список, в который добавляется игрок.
 * @param player - Добавляемый игрок.
 * @param prioritize - Ставить ли игрока в начало списка.
 * @returns Новый список с добавленным игроком.
 */
const insertPlayer = (queue: QueuePlayer[], player: QueuePlayer, prioritize: boolean): QueuePlayer[] => {
  if (!prioritize) return [...queue, player]

  const firstNonSubscriberIndex = queue.findIndex(p => !p.isSubscriber)
  const insertIndex = firstNonSubscriberIndex === -1 ? queue.length : firstNonSubscriberIndex

  return [...queue.slice(0, insertIndex), player, ...queue.slice(insertIndex)]
}

/**
 * Рассчитывает результат заявки игрока по правилам очереди.
 *
 * @returns Статус операции, текст журнала и состояние очереди после операции.
 */
const decideJoin = ({
  prev,
  player,
  isPrivileged,
  isQueueOpen,
  settings,
  source,
}: DecideJoinArgs): JoinDecision => {
  const validationError = validateQueueEntry({
    isQueueOpen,
    username: player.username,
    isPrivileged,
    state: prev,
    settings,
    source,
  })

  if (validationError) {
    return { status: QUEUE_JOIN_STATUSES.DENIED, logMessage: validationError, nextState: prev }
  }

  const displayName = player.displayedUsername || player.username
  const maxActiveSize = settings.maxQueueSize || DEFAULT_QUEUE_SETTINGS.maxQueueSize
  const isActiveQueueNotFull = prev.activeQueue.length < maxActiveSize
  const isPrioritized = Boolean(settings.prioritizeSubscribers) && isPrivileged
  const normalizedUsername = normalizeQueueUsername(player.username)
  const isInActive = prev.activeQueue.some(p =>
    p.userId === player.userId || normalizeQueueUsername(p.username) === normalizedUsername,
  )
  const isInWaiting = prev.waitingQueue.some(p =>
    p.userId === player.userId || normalizeQueueUsername(p.username) === normalizedUsername,
  )

  if (isActiveQueueNotFull && !isInActive) {
    return {
      status: QUEUE_JOIN_STATUSES.JOINED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${displayName} добавлен в активную очередь.`,
      nextState: {
        ...prev,
        activeQueue: insertPlayer(prev.activeQueue, player, isPrioritized),
      },
    }
  }

  if (isActiveQueueNotFull && isInActive && !settings.allowPreJoin) {
    return {
      status: QUEUE_JOIN_STATUSES.DENIED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${displayName} уже в активной очереди, список ожидающих отключен.`,
      nextState: prev,
    }
  }

  if (!isActiveQueueNotFull && !isInActive && !settings.allowPreJoin) {
    return {
      status: QUEUE_JOIN_STATUSES.DENIED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, активная очередь заполнена, а список ожидающих отключен.`,
      nextState: prev,
    }
  }

  if (isInActive && settings.allowPreJoin && !settings.allowMultipleEntries) {
    return {
      status: QUEUE_JOIN_STATUSES.DENIED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${displayName} уже находится в активной очереди, повторная запись запрещена.`,
      nextState: prev,
    }
  }

  if (isInActive && settings.allowPreJoin && settings.allowMultipleEntries && isInWaiting) {
    return {
      status: QUEUE_JOIN_STATUSES.DENIED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${displayName} уже находится и в активной очереди, и в списке ожидающих.`,
      nextState: prev,
    }
  }

  if (!isInActive && settings.allowPreJoin && isInWaiting) {
    return {
      status: QUEUE_JOIN_STATUSES.DENIED,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Отклонено, игрок ${displayName} уже находится в списке ожидающих.`,
      nextState: prev,
    }
  }

  const waitingQueue = insertPlayer(prev.waitingQueue, player, isPrioritized)
  const isPreJoinOfActive = isInActive && settings.allowPreJoin && settings.allowMultipleEntries && !isInWaiting

  if (isPreJoinOfActive) {
    return {
      status: QUEUE_JOIN_STATUSES.WAITING,
      logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${displayName} уже в активной очереди, добавлен в список ожидания.`,
      nextState: { ...prev, waitingQueue },
    }
  }

  return {
    status: QUEUE_JOIN_STATUSES.WAITING,
    logMessage: `${QUEUE_LOG_PREFIXES.JOIN}: Игрок ${displayName} добавлен в список ожидания.`,
    nextState: { ...prev, waitingQueue },
  }
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
  getState,
  setState,
  pushLog,
}: HandleJoinPlayerArgs): JoinQueueResult => {
  const player: QueuePlayer = {
    ...playerData,
    timestamp: customTimestamp || Date.now(),
    gameNickname: extractGameNickname({
      rawMessage: playerData.rawMessage,
      gameConfig: settings.currentGame,
    }),
    isVip: playerData.isVip ?? false,
    isModerator: playerData.isModerator ?? false,
    isSubscriber: playerData.isSubscriber ?? false,
  }

  const decision = decideJoin({
    prev: getState(),
    player,
    isPrivileged: Boolean(playerData.isSubscriber || playerData.isVip || playerData.isModerator),
    isQueueOpen,
    settings,
    source,
  })

  setState(decision.nextState)

  if (decision.status === QUEUE_JOIN_STATUSES.DENIED) {
    if (decision.logMessage) {
      pushLog({ message: decision.logMessage, status: APP_LOG_STATUSES.ERROR, source, actorUsername, rawCommand })
    }

    return { status: decision.status }
  }

  pushLog({ message: decision.logMessage, status: APP_LOG_STATUSES.INFO, source, actorUsername, rawCommand })

  return { status: decision.status }
}
