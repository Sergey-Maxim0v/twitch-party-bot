import { createContext } from 'react'
import type {
  AddQueuePlayerArgs,
  BanQueuePlayerArgs,
  MoveQueuePlayerArgs,
  QueueActionContext,
  QueueActionLog,
  QueueActorContext,
  QueueClearArgs,
  QueueJoinResult,
  QueuePlayer,
  QueueSession,
  QueueState,
  RemovePlayerEverywhereArgs,
  RemoveQueuePlayerArgs,
  UnbanQueuePlayerArgs,
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
  addPlayerToQueue: (args: AddQueuePlayerArgs) => QueueJoinResult;

  /** Удалить запись игрока из конкретной очереди. */
  removePlayerFromQueue: (args: RemoveQueuePlayerArgs) => void;

  /** Полностью удалить игрока из всех очередей. */
  removePlayerFromAllQueues: (args: RemovePlayerEverywhereArgs) => QueueActionLog;

  /** Добавить игрока в бан-лист и удалить его из текущих списков. */
  banPlayerFromQueue: (args: BanQueuePlayerArgs) => void;

  /** Удалить игрока из бан-листа. */
  unbanPlayerFromQueue: (args: UnbanQueuePlayerArgs) => void;

  /** Переместить игрока внутри списка или между списками. */
  movePlayer: (args: MoveQueuePlayerArgs) => void;

  /** Произвести ручную балансировку игроков между очередями. */
  balanceQueues: (args: BalanceQueuesArgs) => void;

  /** Завершить текущую сессию. */
  finishActiveQueue: (args: QueueActionContext) => QueueActionLog;
}

/** React-контекст очереди. */
export const QueueContext = createContext<QueueContextValue | undefined>(undefined)
