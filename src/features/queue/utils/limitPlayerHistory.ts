import type { QueueState } from '../types.ts'
import { PLAYER_HISTORY_LIMIT } from '../../../constants/queue.constants.ts'

type PlayerHistory = QueueState['playerHistory']
type PlayerHistoryStats = PlayerHistory[keyof PlayerHistory]

/** Время последней игры; повреждённые данные считаются как `0`. */
const getLastPlayedTimestamp = (stats: PlayerHistoryStats | null | undefined): number =>
  typeof stats?.lastPlayedTimestamp === 'number' ? stats.lastPlayedTimestamp : 0

/**
 * Оставляет в истории игроков `PLAYER_HISTORY_LIMIT` самых свежих записей:
 * отбрасываются игроки с самым старым `lastPlayedTimestamp`.
 *
 * @param playerHistory - Индекс истории игроков.
 * @returns Индекс, содержащий не более `PLAYER_HISTORY_LIMIT` записей.
 */
export const limitPlayerHistory = (playerHistory: PlayerHistory): PlayerHistory => {
  const entries = Object.entries(playerHistory)

  if (entries.length <= PLAYER_HISTORY_LIMIT) return playerHistory

  return Object.fromEntries(
    entries
      .sort(([, left], [, right]) => getLastPlayedTimestamp(right) - getLastPlayedTimestamp(left))
      .slice(0, PLAYER_HISTORY_LIMIT),
  )
}
