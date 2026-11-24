import type { Dispatch, SetStateAction } from 'react'
import { type QUEUE_JOIN_STATUSES, QUEUE_PLAYER_SOURCE, QUEUE_TYPES } from '../../constants/queue.constants.ts'
import type { AppLogItem, AppLogStatus } from '../app-logs/types.ts'
import type { AppLogsContextValue } from '../app-logs/context/AppLogsInstance.ts'
import type { ClassNameProps } from '../../types/common.types.ts'

export { QUEUE_PLAYER_SOURCE, QUEUE_TYPES }

export type QueuePlayerSource = typeof QUEUE_PLAYER_SOURCE[keyof typeof QUEUE_PLAYER_SOURCE]

export type QueueSetState = Dispatch<SetStateAction<QueueState>>

interface BaseQueuePlayer {
  userId: string;
  username: string;
  displayedUsername?: string;
  rawMessage: string;
  playerSource: QueuePlayerSource;
}

export interface QueuePlayer extends BaseQueuePlayer {
  /** Уникальный идентификатор записи, не зависящий от данных игрока. */
  queueEntryId: string;
  timestamp: number;
  isSubscriber: boolean;
  isModerator: boolean;
  isVip: boolean;
  gameNickname?: string | null;
}

export interface QueuePlayerFormData extends BaseQueuePlayer {
  timestamp?: number;
  isSubscriber?: boolean;
  isModerator?: boolean;
  isVip?: boolean;
}

export type QueueType = typeof QUEUE_TYPES[keyof typeof QUEUE_TYPES]

export type MutableQueueType = Exclude<QueueType, typeof QUEUE_TYPES.HISTORY>

/** Запись игрока и список, в котором она находится. */
export interface QueueEntry {
  player: QueuePlayer;
  queueType: MutableQueueType;
}

/** Общие пропсы компонентов карточки игрока. */
export interface QueueEntryProps extends ClassNameProps {
  /** Данные игрока. */
  player: QueuePlayer;
  /** Очередь, в которой находится игрок. */
  queueType: QueueType;
}

/** Одна игровая сессия (состав) в истории. */
export interface QueueSession {
  id: string;
  name: string;
  createdAt: number;
  playedAt?: number;
  players: QueuePlayer[];
}

/** Статистика игрока для расчёта кулдаунов. */
export interface PlayerHistoryStats {
  lastPlayedTimestamp: number;
  lastPlayedSessionNumber: number;
  gamesPlayed: number;
  userID: string;
  username: string;
}

/** Состояние очереди, хранящееся в стейте и localStorage. */
export interface QueueState {
  activeQueue: QueuePlayer[];
  waitingQueue: QueuePlayer[];
  queueHistory: QueueSession[];
  globalSessionCounter: number;
  playerHistory: Record<BaseQueuePlayer['username'], PlayerHistoryStats>;
}

/** Решение по перемещению игрока: новое состояние и результат операции. */
export interface MoveDecision {
  nextState: QueueState;
  isMoved: boolean;
  /** Попытка перемещения не изменила порядок. */
  isNoop: boolean;
  /** Перемещение отклонено из-за дупликата. */
  isBlockedByDuplicate: boolean;
  /** Перемещение отклонено, потому что список ожидающих отключён. */
  isBlockedByDisabledWaiting: boolean;
  sourceQueueType: MutableQueueType | null;
  playerName: string;
  /** Фактическая позиция вставки (0-based). */
  insertIndex: number | null;
  displacedToWaiting: QueuePlayer[];
  displacedRemoved: QueuePlayer[];
  displacedAlreadyWaiting: QueuePlayer[];
}

export type QueueJoinStatus = typeof QUEUE_JOIN_STATUSES[keyof typeof QUEUE_JOIN_STATUSES]

export interface QueueActionLog {
  message: string;
  logStatus: AppLogStatus;
}

export interface QueueJoinResult extends QueueActionLog {
  status: QueueJoinStatus;
}

/** Общий контекст действия с очередью. */
export interface QueueActionContext {
  source: AppLogItem['source'];
  actorUsername: string;
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
}

export type QueueActorContext = Pick<QueueActionContext, 'source' | 'actorUsername'>

export interface QueueClearArgs extends QueueActionContext {
  /** Отправлять ли сообщение об очистке в чат. */
  notify?: boolean;
}

export interface QueueHandlerArgs extends QueueActionContext {
  setState: QueueSetState;
  getState: () => QueueState;
  pushLog: AppLogsContextValue['pushLog'];
}

/** Доступ к состоянию очереди и журналу, общий для обработчиков и хуков. */
export type QueueStateAccess = Pick<QueueHandlerArgs, 'setState' | 'getState' | 'pushLog'>

/** Действие над игроком, вызванное из интерфейса или из чата. */
export type QueuePlayerCommandArgs = QueueActionContext & {
  username: string;
  displayedUsername?: string;
}

/** Аргументы добавления игрока в очередь. */
export type AddQueuePlayerArgs = QueueActionContext & {
  playerData: QueuePlayerFormData;
  customTimestamp?: number;
}

/** Аргументы удаления записи игрока из конкретной очереди. */
export type RemoveQueuePlayerArgs = QueuePlayerCommandArgs & {
  userId: string;
  targetQueueType: QueueType;
  rawCommand?: string;
}

/** Аргументы полного удаления игрока из всех очередей. */
export type RemovePlayerEverywhereArgs = QueuePlayerCommandArgs & {
  userId: string;
}

/** Аргументы бана игрока. */
export type BanQueuePlayerArgs = Omit<QueuePlayerCommandArgs, 'userId'> & {
  userId?: string;
}

/** Аргументы перемещения игрока внутри списка или между списками. */
export type MoveQueuePlayerArgs = QueuePlayerCommandArgs & {
  queueEntryId: string;
  userId: string;
  sourceQueueType: MutableQueueType;
  targetQueueType: MutableQueueType;
  targetIndex: number | undefined;
}

/** Аргументы разбана игрока. */
export type UnbanQueuePlayerArgs = QueueActorContext & {
  username: string;
}
