export type QueuePlayerSource = 'app' | 'mod_cmd' | 'user_cmd'

/**
 * Общие данные игрока
 */
export interface BaseQueuePlayer {
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
export const QUEUE_TYPES = {
  ACTIVE: 'active',
  FUTURE: 'future',
  HISTORY: 'history',
} as const

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
export interface PlayerHistoryStats {
  /** Последний timestamp, когда игрок заходил/играл */
  lastPlayedTimestamp: number;
  /** Порядковый номер сессии, в которой игрок сыграл последний раз */
  lastPlayedSessionNumber: number;
}

/**
 * Главный объект состояния всей очереди (для хранения в стейте / localStorage)
 */
export interface QueueState {
  /** Игроки в текущей активной очереди */
  activeQueue: QueuePlayer[];
  /** Игроки в будущих/ожидающих очередях */
  futureQueue: QueuePlayer[];
  /** История завершенных игровых сессий (составов) */
  queueHistory: QueueSession[];
  /** Общий счетчик созданных/сыгранных сессий для расчета кулдауна по играм */
  globalSessionCounter: number;
  /** Быстрый индекс истории игроков для проверки временных и сессионных кулдаунов */
  playerHistory: Record<string, PlayerHistoryStats>;
}
