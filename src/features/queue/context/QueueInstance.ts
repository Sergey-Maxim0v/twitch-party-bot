import { createContext } from 'react'
import type { QueueState, QueuePlayer, QueueSession, QueuePlayerFormData, QueueType } from '../types'
import type { LogSource } from '../../app-logs/types.ts'

export interface QueueContextValue {
  // === Реактивные состояния (Стейты) ===
  /** Игроки в текущей активной очереди */
  activeQueue: QueuePlayer[];
  /** Игроки в будущих/ожидающих очередях */
  futureQueue: QueuePlayer[];
  /** История завершенных игровых сессий (составов) */
  queueHistory: QueueSession[];
  /** Полный сырой объект состояния очереди (для отладки/сохранения) */
  rawState: QueueState;

  // === Методы очистки (Clear) ===
  /** Очистить текущую активную очередь */
  clearActiveQueue: (args: { source: LogSource; actorUsername: string; actorRole: string }) => void;
  /** Очистить будущие очереди */
  clearFutureQueue: (args: { source: LogSource; actorUsername: string; actorRole: string }) => void;
  /** Очистить историю сыгранных сессий */
  clearQueueHistory: (args: { source: LogSource; actorUsername: string; actorRole: string }) => void;

  // === Управление игроками (CRUD) ===
  /** Добавить игрока в очередь (в активную или будущую на основе правил) */
  addPlayerToQueue: (args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => void;

  /** Удалить первую найденную запись игрока из конкретной очереди (активной или будущей) */
  removePlayerFromQueue: (args: {
    userId: string;
    targetQueueType: QueueType;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => void;

  /** Полностью удалить игрока из всех существующих очередей (например, при команде !leave) */
  removePlayerFromAllQueues: (args: {
    userId: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => void;

  /** Добавить игрока во внутренний бан-лист очереди и удалить его из текущих списков */
  banPlayerFromQueue: (args: {
    userId?: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => void;

  /** Универсальное перемещение игрока внутри списков или между ними (Drag-and-Drop) */
  movePlayer: (args: {
    userId: string;
    targetQueueType: 'active' | 'future';
    targetIndex: number | undefined;
    source: LogSource;
    actorUsername: string;
  }) => void;

  // === Жизненный цикл очереди ===
  /** Завершить текущую очередь (активная улетает в историю, будущая ротируется) */
  finishActiveQueue: (args: { source: LogSource; actorUsername: string }) => void;
}

export const QueueContext = createContext<QueueContextValue | undefined>(undefined)
