import type { QueuePlayer } from '../types.ts'
import { isSameQueuePlayer } from './isSameQueuePlayer.ts'

/**
 * Проверяет наличие игрока в списке по ID или никнейму.
 *
 * @param queue - Проверяемый список.
 * @param player - Игрок для поиска.
 * @returns `true`, если игрок уже есть в списке.
 */
export const hasQueuePlayer = (
  queue: QueuePlayer[],
  player: Pick<QueuePlayer, 'userId' | 'username'>,
): boolean => queue.some(item => isSameQueuePlayer(item, player))
