import type { QueuePlayer } from '../types.ts'
import { normalizeQueueUsername } from './normalizeQueueUsername.ts'

/**
 * Проверяет, что две записи относятся к одному игроку.
 *
 * @param first - Первая запись.
 * @param second - Вторая запись.
 * @returns `true`, если совпадает ID или нормализованный никнейм.
 */
export const isSameQueuePlayer = (
  first: Pick<QueuePlayer, 'userId' | 'username'>,
  second: Pick<QueuePlayer, 'userId' | 'username'>,
): boolean =>
  first.userId === second.userId
  || normalizeQueueUsername(first.username) === normalizeQueueUsername(second.username)
