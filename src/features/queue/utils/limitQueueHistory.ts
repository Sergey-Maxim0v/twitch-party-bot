import type { QueueSession } from '../types.ts'
import { QUEUE_HISTORY_LIMIT } from '../../../constants/queue.constants.ts'

/**
 * Ограничивает историю игровых сессий последними `QUEUE_HISTORY_LIMIT` записями.
 * Новые сессии хранятся в начале массива, поэтому отбрасываются самые старые.
 *
 * @param history - История завершённых сессий.
 * @returns История, содержащая не более `QUEUE_HISTORY_LIMIT` записей.
 */
export const limitQueueHistory = (history: QueueSession[]): QueueSession[] =>
  history.length > QUEUE_HISTORY_LIMIT ? history.slice(0, QUEUE_HISTORY_LIMIT) : history
