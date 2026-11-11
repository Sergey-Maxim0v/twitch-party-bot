import type { Dispatch, SetStateAction } from 'react'
import { QUEUE_PLAYER_SOURCE, QUEUE_TYPES } from '../../constants/queue.constants.ts'
import type { AppLogItem } from '../app-logs/types.ts'
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
interface PlayerHistoryStats {
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

/**
 * Базовые аргументы обработчиков очереди, работающих со списками игроков.
 */
export interface QueueHandlerArgs {
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Источник вызова команды (чат/интерфейс). */
  source: AppLogItem['source'];
  /** Никнейм того, кто выполнил действие. */
  actorUsername: string;
  /** Хелпер провайдера для записи логов. */
  pushLog: AppLogsContextValue['pushLog'];
}
