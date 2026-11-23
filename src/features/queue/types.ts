import type { Dispatch, SetStateAction } from 'react'
import { QUEUE_JOIN_STATUSES, QUEUE_PLAYER_SOURCE, QUEUE_TYPES } from '../../constants/queue.constants.ts'
import type { AppLogItem, AppLogStatus } from '../app-logs/types.ts'
import type { AppLogsContextValue } from '../app-logs/context/AppLogsInstance.ts'

export { QUEUE_PLAYER_SOURCE, QUEUE_TYPES }

/** Источник появления игрока в очереди. */
export type QueuePlayerSource = typeof QUEUE_PLAYER_SOURCE[keyof typeof QUEUE_PLAYER_SOURCE]

/**
 * Базовые данные игрока, общие для всех сценариев добавления.
 */
interface BaseQueuePlayer {
  userId: string;
  username: string;
  displayedUsername?: string;
  rawMessage: string;
  playerSource: QueuePlayerSource;
}

/**
 * Данные игрока в очереди
 */
export interface QueuePlayer extends BaseQueuePlayer {
  /** Уникальный идентификатор записи, не зависящий от данных игрока. */
  queueEntryId: string;
  timestamp: number;
  isSubscriber: boolean;
  isModerator: boolean;
  isVip: boolean;
  gameNickname?: string | null;
}

/**
 * Данные игрока для постановки в очередь
 */
export interface QueuePlayerFormData extends BaseQueuePlayer {
  timestamp?: number;
  isSubscriber?: boolean;
  isModerator?: boolean;
  isVip?: boolean;
}

/**
 * Типы очередей в приложении
 */
export type QueueType = typeof QUEUE_TYPES[keyof typeof QUEUE_TYPES]

/** Тип списка очереди, доступного для перемещения игроков. */
export type MutableQueueType = Exclude<QueueType, typeof QUEUE_TYPES.HISTORY>

/** Запись игрока и список, в котором она находится. */
export interface QueueEntry {
  /** Игрок в списке. */
  player: QueuePlayer;
  /** Список, в котором находится игрок. */
  queueType: MutableQueueType;
}

/**
 * Структура одной игровой сессии (состава) в истории
 */
export interface QueueSession {
  /** Уникальный ID состава */
  id: string;
  /** Порядковое название для интерфейса */
  name: string;
  /** Время создания сессии */
  createdAt: number;
  /** Время, когда сессия была завершена/отправлена в историю */
  playedAt?: number;
  /** Список участников в этом конкретном составе */
  players: QueuePlayer[];
}

/**
 * Статистика истории игрока для расчета всех типов кулдаунов
 */
export interface PlayerHistoryStats {
  /** Последний timestamp, когда игрок заходил/играл */
  lastPlayedTimestamp: number;
  /** Порядковый номер сессии, в которой игрок сыграл последний раз */
  lastPlayedSessionNumber: number;
  /** Количество сыгранных игр/сессий за текущий стрим */
  gamesPlayed: number;
  /** Уникальный ID игрока на платформе */
  userID: string;
  /** Никнейм игрока на платформе (для поиска ручных добавлений) */
  username: string;
}

/**
 * Главный объект состояния всей очереди (для хранения в стейте / localStorage)
 */
export interface QueueState {
  /** Игроки в текущей активной очереди */
  activeQueue: QueuePlayer[];
  /** Игроки в списке ожидающих */
  waitingQueue: QueuePlayer[];
  /** История завершенных игровых сессий (составов) */
  queueHistory: QueueSession[];
  /** Общий счетчик созданных/сыгранных сессий для расчета кулдауна по играм */
  globalSessionCounter: number;
  /** Быстрый индекс истории игроков для проверки временных и сессионных кулдаунов */
  playerHistory: Record<BaseQueuePlayer['username'], PlayerHistoryStats>;
}

/** Статус попытки добавления игрока в очередь. */
export type QueueJoinStatus = typeof QUEUE_JOIN_STATUSES[keyof typeof QUEUE_JOIN_STATUSES]

/**
 * Результат действия с очередью для записи в журнал приложения.
 */
export interface QueueActionLog {
  /** Текст записи в журнале. */
  message: string;
  /** Статус записи в журнале. */
  logStatus: AppLogStatus;
}

/**
 * Результат добавления игрока в очередь.
 */
export interface QueueJoinResult extends QueueActionLog {
  /** Итоговый статус добавления. */
  status: QueueJoinStatus;
}

/** Аргументы очистки активной очереди или списка ожидающих. */
export interface QueueClearArgs {
  /** Источник вызова команды (чат/интерфейс). */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил действие. */
  actorUsername: string;
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
  /** Отправлять ли сообщение об очистке в чат. */
  notify?: boolean;
}

/**
 * Базовые аргументы обработчиков очереди, работающих со списками игроков.
 */
export interface QueueHandlerArgs {
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Источник вызова команды (чат/интерфейс). */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил действие. */
  actorUsername: string;
  /** Хелпер провайдера для записи логов. */
  pushLog: AppLogsContextValue['pushLog'];
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
}
