import type { QueuePlayer } from '../types.ts'

/**
 * Формирует список отображаемых имён игроков.
 *
 * @param players - Список игроков.
 * @returns Имена, разделённые запятой.
 */
export const formatQueuePlayerNames = (players: QueuePlayer[]): string =>
  players.map(player => player.displayedUsername ?? player.username).join(', ')
