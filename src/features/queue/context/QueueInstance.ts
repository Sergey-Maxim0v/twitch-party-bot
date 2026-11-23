import { createContext } from 'react'
import {
  type MutableQueueType,
  type QueueActionContext,
  type QueueActionLog,
  type QueueActorContext,
  type QueueClearArgs,
  type QueueJoinResult,
  type QueuePlayer,
  type QueuePlayerFormData,
  type QueueSession,
  type QueueState,
  type QueueType,
} from '../types'
import type { QueueSettings } from '../../queue-settings/types.ts'

type QueueBalanceOverrideKey = 'allowPreJoin' | 'maxQueueSize' | 'moveOnSizeChange'

/** Аргументы ручной балансировки очередей. */
export type BalanceQueuesArgs = QueueActorContext & {
  [Key in QueueBalanceOverrideKey as `override${Capitalize<Key>}`]?: QueueSettings[Key]
}

/** Публичный API контекста очереди. */
export interface QueueContextValue {
  /** Текущий статус очереди. */
  isQueueOpen: boolean;
  /** Открыть приём заявок в очередь. */
  openQueue: (args: QueueActionContext) => QueueActionLog;
  /** Приостановить приём заявок в очередь. */
  closeQueue: (args: QueueActionContext) => QueueActionLog;

  /** Игроки в активной очереди. */
  activeQueue: QueuePlayer[];
  /** Игроки в списке ожидающих. */
  waitingQueue: QueuePlayer[];
  /** История завершённых сессий. */
  queueHistory: QueueSession[];
  /** Чтение актуального состояния без подписки на изменения. */
  getState: () => QueueState;

  /** Очистить активную очередь. */
  clearActiveQueue: (args: QueueClearArgs) => QueueActionLog;
  /** Очистить список ожидающих. */
  clearWaitingQueue: (args: QueueClearArgs) => QueueActionLog;
  /** Очистить историю сыгранных сессий. */
  clearQueueHistory: (args: QueueActorContext) => void;

  /** Добавить игрока в активную очередь или список ожидающих. */
  addPlayerToQueue: (args: QueueActionContext & {
    playerData: QueuePlayerFormData;
    customTimestamp?: number;
  }) => QueueJoinResult;

  /** Удалить запись игрока из конкретной очереди. */
  removePlayerFromQueue: (args: QueueActorContext & {
    userId: string;
    username: string;
    displayedUsername?: string;
    targetQueueType: QueueType;
    rawCommand?: string;
  }) => void;

  /** Полностью удалить игрока из всех очередей. */
  removePlayerFromAllQueues: (args: QueueActionContext & {
    userId: string;
    username: string;
    displayedUsername?: string;
  }) => QueueActionLog;

  /** Добавить игрока в бан-лист и удалить его из текущих списков. */
  banPlayerFromQueue: (args: QueueActorContext & {
    userId?: string;
    username: string;
    displayedUsername?: string;
  }) => void;

  /** Удалить игрока из бан-листа. */
  unbanPlayerFromQueue: (args: QueueActorContext & { username: string }) => void;

  /** Переместить игрока внутри списка или между списками. */
  movePlayer: (args: QueueActorContext & {
    queueEntryId: string;
    userId: string;
    username: string;
    displayedUsername?: string;
    sourceQueueType: MutableQueueType;
    targetQueueType: MutableQueueType;
    targetIndex: number | undefined;
  }) => void;

  /** Произвести ручную балансировку игроков между очередями. */
  balanceQueues: (args: BalanceQueuesArgs) => void;

  /** Завершить текущую сессию. */
  finishActiveQueue: (args: QueueActionContext) => QueueActionLog;
}

/** React-контекст очереди. */
export const QueueContext = createContext<QueueContextValue | undefined>(undefined)
