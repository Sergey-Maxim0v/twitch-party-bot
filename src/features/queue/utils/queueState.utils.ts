import {
  PLAYER_HISTORY_LIMIT,
  QUEUE_ENTRY_ID_PREFIX,
  QUEUE_HISTORY_LIMIT,
  QUEUE_PLAYER_SOURCE,
} from '../../../constants/queue.constants.ts'
import { mergeWithDefaults } from '../../../hooks/utils/storage.utils.ts'
import { filterNotNull } from '../../../utils/arrays.ts'
import { createId } from '../../../utils/createId.ts'
import { isPlainObject } from '../../../utils/objects.ts'
import { hasControlCharacters, isFilledString } from '../../../utils/strings.ts'
import type {
  PlayerHistoryStats,
  QueuePlayer,
  QueuePlayerSource,
  QueueSession,
  QueueState,
} from '../types.ts'
import { dedupeQueuePlayers, normalizeQueueUsername } from './queuePlayers.utils.ts'

type PlayerHistory = QueueState['playerHistory']

const QUEUE_PLAYER_SOURCES: readonly string[] = Object.values(QUEUE_PLAYER_SOURCE)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isQueuePlayerSource = (value: unknown): value is QueuePlayerSource =>
  typeof value === 'string' && QUEUE_PLAYER_SOURCES.includes(value)

export const createInitialState = (): QueueState => ({
  activeQueue: [],
  waitingQueue: [],
  queueHistory: [],
  globalSessionCounter: 0,
  playerHistory: {},
})

// Новые сессии хранятся в начале массива, поэтому отбрасываются самые старые.
export const limitQueueHistory = (history: QueueSession[]): QueueSession[] =>
  history.length > QUEUE_HISTORY_LIMIT ? history.slice(0, QUEUE_HISTORY_LIMIT) : history

/** Время последней игры; повреждённые данные считаются как `0`. */
const getLastPlayedTimestamp = (stats: PlayerHistoryStats | null | undefined): number =>
  typeof stats?.lastPlayedTimestamp === 'number' ? stats.lastPlayedTimestamp : 0

export const limitPlayerHistory = (playerHistory: PlayerHistory): PlayerHistory => {
  const entries = Object.entries(playerHistory)

  if (entries.length <= PLAYER_HISTORY_LIMIT) return playerHistory

  return Object.fromEntries(
    entries
      .sort(([, left], [, right]) => getLastPlayedTimestamp(right) - getLastPlayedTimestamp(left))
      .slice(0, PLAYER_HISTORY_LIMIT),
  )
}

const toQueuePlayer = (value: unknown): QueuePlayer | null => {
  if (!isPlainObject(value) || !isFilledString(value.username) || hasControlCharacters(value.username)) return null

  const username = normalizeQueueUsername(value.username)
  if (!username) return null

  const displayedUsername = isFilledString(value.displayedUsername) && !hasControlCharacters(value.displayedUsername)
    ? value.displayedUsername
    : undefined

  return {
    // Идентификатор записи не зависит от данных игрока и используется для Drag-and-Drop.
    queueEntryId: isFilledString(value.queueEntryId) ? value.queueEntryId : createId(QUEUE_ENTRY_ID_PREFIX),
    // Пустой userId подставляем никнеймом, чтобы работали поиск и удаление.
    userId: isFilledString(value.userId) ? value.userId : username,
    username,
    displayedUsername,
    rawMessage: typeof value.rawMessage === 'string' ? value.rawMessage : '',
    playerSource: isQueuePlayerSource(value.playerSource) ? value.playerSource : QUEUE_PLAYER_SOURCE.APP,
    timestamp: isFiniteNumber(value.timestamp) ? value.timestamp : 0,
    isSubscriber: value.isSubscriber === true,
    isModerator: value.isModerator === true,
    isVip: value.isVip === true,
    gameNickname: isFilledString(value.gameNickname) ? value.gameNickname : null,
  }
}

const toQueueSession = (value: unknown): QueueSession | null => {
  if (!isPlainObject(value) || !isFilledString(value.id) || !Array.isArray(value.players)) return null

  return {
    id: value.id,
    name: typeof value.name === 'string' ? value.name : '',
    createdAt: isFiniteNumber(value.createdAt) ? value.createdAt : 0,
    playedAt: isFiniteNumber(value.playedAt) ? value.playedAt : undefined,
    players: filterNotNull(value.players.map(toQueuePlayer)),
  }
}

const toPlayerHistoryStats = (value: unknown): PlayerHistoryStats | null => {
  if (!isPlainObject(value)) return null

  const { gamesPlayed, lastPlayedSessionNumber, lastPlayedTimestamp, userID, username } = value

  if (
    !isFiniteNumber(lastPlayedTimestamp)
    || !isFiniteNumber(lastPlayedSessionNumber)
    || !isFiniteNumber(gamesPlayed)
    || typeof userID !== 'string'
    || !isFilledString(username)
  ) {
    return null
  }

  return { lastPlayedTimestamp, lastPlayedSessionNumber, gamesPlayed, userID, username }
}

const mergePlayerHistoryStats = (
  current: PlayerHistoryStats,
  incoming: PlayerHistoryStats,
): PlayerHistoryStats => {
  const isIncomingNewer = incoming.lastPlayedTimestamp > current.lastPlayedTimestamp
    || (incoming.lastPlayedTimestamp === current.lastPlayedTimestamp
      && incoming.lastPlayedSessionNumber > current.lastPlayedSessionNumber)
  const latestStats = isIncomingNewer ? incoming : current

  return { ...latestStats, gamesPlayed: current.gamesPlayed + incoming.gamesPlayed }
}

const sanitizePlayerHistory = (history: QueueState['playerHistory']): QueueState['playerHistory'] => {
  const normalizedHistory = new Map<string, PlayerHistoryStats>()

  Object.entries(history).forEach(([key, stats]) => {
    const username = normalizeQueueUsername(key)
    const validStats = toPlayerHistoryStats(stats)
    if (!username || !validStats) return

    const incomingStats: PlayerHistoryStats = { ...validStats, username }
    const currentStats = normalizedHistory.get(username)

    normalizedHistory.set(username, currentStats
      ? mergePlayerHistoryStats(currentStats, incomingStats)
      : incomingStats)
  })

  return Object.fromEntries(normalizedHistory)
}

/** Приводит сохранённое состояние к актуальной структуре и отбрасывает повреждённые записи. */
export const sanitizeQueueState = (stored: unknown): QueueState => {
  const state = mergeWithDefaults(createInitialState(), stored)

  return {
    ...state,
    activeQueue: dedupeQueuePlayers(filterNotNull(state.activeQueue.map(toQueuePlayer))),
    waitingQueue: dedupeQueuePlayers(filterNotNull(state.waitingQueue.map(toQueuePlayer))),
    queueHistory: filterNotNull(state.queueHistory.map(toQueueSession)),
    playerHistory: sanitizePlayerHistory(state.playerHistory),
  }
}
