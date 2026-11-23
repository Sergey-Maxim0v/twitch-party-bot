import {
  QUEUE_TYPES,
  type MutableQueueType,
  type QueueEntry,
  type QueuePlayer,
  type QueueState,
} from '../types.ts'

/** Приводит никнейм к виду для сравнения: без внешних пробелов, в нижнем регистре. */
export const normalizeQueueUsername = (username: unknown): string =>
  typeof username === 'string' ? username.trim().toLowerCase() : ''

export const isSameQueuePlayer = (
  first: Pick<QueuePlayer, 'userId' | 'username'>,
  second: Pick<QueuePlayer, 'userId' | 'username'>,
): boolean =>
  first.userId === second.userId
  || normalizeQueueUsername(first.username) === normalizeQueueUsername(second.username)

export const hasQueuePlayer = (
  queue: QueuePlayer[],
  player: Pick<QueuePlayer, 'userId' | 'username'>,
): boolean => queue.some(item => isSameQueuePlayer(item, player))

/** Удаляет повторные записи, оставляя первое вхождение. */
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

export const isPrivilegedPlayer = (
  player: Pick<QueuePlayer, 'isModerator' | 'isSubscriber' | 'isVip'>,
): boolean => player.isSubscriber || player.isVip || player.isModerator

export const getQueuePlayerName = (player: Pick<QueuePlayer, 'displayedUsername' | 'username'>): string =>
  player.displayedUsername ?? player.username

export const formatQueuePlayerNames = (players: QueuePlayer[]): string =>
  players.map(getQueuePlayerName).join(', ')

export const getQueueByType = (
  activeQueue: QueuePlayer[],
  waitingQueue: QueuePlayer[],
  queueType: MutableQueueType,
): QueuePlayer[] => queueType === QUEUE_TYPES.ACTIVE ? activeQueue : waitingQueue

export const findQueueEntry = (
  activeQueue: QueuePlayer[],
  waitingQueue: QueuePlayer[],
  queueEntryId: string,
): QueueEntry | null => {
  const activePlayer = activeQueue.find(player => player.queueEntryId === queueEntryId)
  if (activePlayer) return { player: activePlayer, queueType: QUEUE_TYPES.ACTIVE }

  const waitingPlayer = waitingQueue.find(player => player.queueEntryId === queueEntryId)
  if (waitingPlayer) return { player: waitingPlayer, queueType: QUEUE_TYPES.WAITING }

  return null
}

export const hasSameQueueOrder = (prev: QueueState, next: QueueState): boolean => {
  if (prev.activeQueue.length !== next.activeQueue.length) return false
  if (prev.waitingQueue.length !== next.waitingQueue.length) return false

  return prev.activeQueue.every((player, index) =>
    player.queueEntryId === next.activeQueue[index].queueEntryId)
    && prev.waitingQueue.every((player, index) =>
      player.queueEntryId === next.waitingQueue[index].queueEntryId)
}
