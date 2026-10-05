import { createContext } from 'react'
import {
  type QueueState,
  type QueuePlayer,
  type QueueSession,
  type QueuePlayerFormData,
  type QueueType,
} from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import type { QueueSettings } from '../../queue-settings/types.ts'

export interface QueueContextValue {
  /** Текущий статус очереди. */
  isQueueOpen: boolean;
  /** Открыть прием заявок в очередь */
  openQueue: (args: { source: LogSource; actorUsername: string }) => void;
  /** Приостановить прием заявок в очередь */
  closeQueue: (args: { source: LogSource; actorUsername: string }) => void;

  // === Реактивные состояния (Стейты) ===
  /** Игроки в текущей активной очереди */
  activeQueue: QueuePlayer[];
  /** Игроки в списке ожидающих */
  waitingQueue: QueuePlayer[];
  /** История завершенных игровых сессий (составов) */
  queueHistory: QueueSession[];
  /** Полный сырой объект состояния очереди (для отладки/сохранения) */
  rawState: QueueState;

  // === Методы очистки (Clear) ===
  /** Очистить текущую активную очередь */
  clearActiveQueue: (args: { source: LogSource; actorUsername: string; }) => void;
  /** Очистить список ожидающих */
  clearWaitingQueue: (args: { source: LogSource; actorUsername: string; }) => void;
  /** Очистить историю сыгранных сессий */
  clearQueueHistory: (args: { source: LogSource; actorUsername: string; }) => void;

  // === Управление игроками (CRUD) ===
  /** Добавить игрока в очередь (в активную или список ожидающих на основе правил) */
  addPlayerToQueue: (args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => void;

  /** Удалить первую найденную запись игрока из конкретной очереди (активной или ожидающих) */
  removePlayerFromQueue: (args: {
    userId: string;
    displayedUsername?: string;
    targetQueueType: QueueType;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => void;

  /** Полностью удалить игрока из всех существующих очередей (например, при команде !leave) */
  removePlayerFromAllQueues: (args: {
    userId: string;
    username: string;
    displayedUsername?: string;
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
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
    source: LogSource;
    actorUsername: string;
  }) => void;

  /** Произвести ручную балансировку игроков между активной очередью и списком ожидания.  */
  balanceQueues: (args: {
    source: LogSource;
    actorUsername: string;
    overrideMaxQueueSize?: QueueSettings['maxQueueSize'];
    overrideMoveOnSizeChange?: QueueSettings['moveOnSizeChange'];
    overrideAllowPreJoin?: QueueSettings['allowPreJoin'];
  }) => void;

  // === Жизненный цикл очереди ===
  /** Завершить текущую очередь (активная улетает в историю, из ожидающих переносятся) */
  finishActiveQueue: (args: { source: LogSource; actorUsername: string }) => void;
}

export const QueueContext = createContext<QueueContextValue | undefined>(undefined)
