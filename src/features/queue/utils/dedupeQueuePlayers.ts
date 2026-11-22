import type { QueuePlayer } from '../types.ts'
import { normalizeQueueUsername } from './normalizeQueueUsername.ts'

/**
 * Удаляет повторные записи игроков, оставляя первое вхождение.
 *
 * @param players - Список игроков.
 * @returns Список без дублей по ID или никнейму.
 */
export const dedupeQueuePlayers = (players: QueuePlayer[]): QueuePlayer[] => {
  const userIds = new Set<string>()
  const usernames = new Set<string>()

  return players.filter(player => {
    const username = normalizeQueueUsername(player.username)

    if (userIds.has(player.userId) || usernames.has(username)) return false

    userIds.add(player.userId)
    usernames.add(username)
    return true
  })
}
