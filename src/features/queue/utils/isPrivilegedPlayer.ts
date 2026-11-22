import type { QueuePlayer } from '../types.ts'

/**
 * Проверяет, что игрок является подписчиком, VIP или модератором.
 *
 * @param player - Проверяемый игрок.
 * @returns `true`, если у игрока есть привилегия.
 */
export const isPrivilegedPlayer = (
  player: Pick<QueuePlayer, 'isModerator' | 'isSubscriber' | 'isVip'>,
): boolean => player.isSubscriber || player.isVip || player.isModerator
