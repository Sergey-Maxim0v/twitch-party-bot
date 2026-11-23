import type { QueuePlayer } from '../types.ts'
import { normalizeQueueUsername } from './normalizeQueueUsername.ts'

/**
 * Удаляет повторные записи игроков, оставляя первое вхождение.
 *
 * @param players - Список игроков.
 * @returns Список без дублей по идентификатору записи, ID или никнейму.
 */
export const dedupeQueuePlayers = (players: QueuePlayer[]): QueuePlayer[] => {
  const queueEntryIds = new Set<string>()
  const userIds = new Set<string>()
  const usernames = new Set<string>()

  return players.filter(player => {
    const username = normalizeQueueUsername(player.username)

    if (queueEntryIds.has(player.queueEntryId) || userIds.has(player.userId) || usernames.has(username)) {
      return false
    }

    queueEntryIds.add(player.queueEntryId)
    userIds.add(player.userId)
    usernames.add(username)
    return true
  })
}
