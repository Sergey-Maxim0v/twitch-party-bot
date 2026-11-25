import type { QueuePlayer } from '../types.ts'
import { isPrivilegedPlayer } from './queuePlayers.utils.ts'

/** Вставляет игрока в конец очереди или перед первым простым игроком. */
export const insertQueuePlayer = (queue: QueuePlayer[], player: QueuePlayer, prioritize: boolean): QueuePlayer[] => {
  if (!prioritize) return [...queue, player]

  const firstRegularIndex = queue.findIndex(item => !isPrivilegedPlayer(item))
  const insertIndex = firstRegularIndex === -1 ? queue.length : firstRegularIndex

  return [...queue.slice(0, insertIndex), player, ...queue.slice(insertIndex)]
}
