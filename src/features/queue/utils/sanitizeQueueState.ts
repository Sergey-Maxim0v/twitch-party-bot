import type { PlayerHistoryStats, QueuePlayer, QueuePlayerSource, QueueSession, QueueState } from '../types.ts'
import { QUEUE_ENTRY_ID_PREFIX, QUEUE_PLAYER_SOURCE } from '../../../constants/queue.constants.ts'
import { createId } from '../../../utils/createId.ts'
import { mergeWithDefaults } from '../../../hooks/utils/storage.utils.ts'
import { filterNotNull } from '../../../utils/arrays.ts'
import { isPlainObject } from '../../../utils/objects.ts'
import { hasControlCharacters, isFilledString } from '../../../utils/strings.ts'
import { createInitialState } from './createInitialState.ts'
import { dedupeQueuePlayers } from './dedupeQueuePlayers.ts'
import { normalizeQueueUsername } from './normalizeQueueUsername.ts'

/** Источники появления игрока, допустимые в сохранённых данных. */
const QUEUE_PLAYER_SOURCES: readonly string[] = Object.values(QUEUE_PLAYER_SOURCE)

/**
 * Проверяет, что значение — конечное число.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение — число без `NaN` и `Infinity`.
 */
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/**
 * Проверяет, что значение — поддерживаемый источник появления игрока.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение входит в `QUEUE_PLAYER_SOURCE`.
 */
const isQueuePlayerSource = (value: unknown): value is QueuePlayerSource =>
  typeof value === 'string' && QUEUE_PLAYER_SOURCES.includes(value)

/**
 * Восстанавливает игрока, нормализуя логин и отбрасывая некорректные никнеймы.
 *
 * @param value - Значение из хранилища.
 * @returns Игрок или `null`, если в записи нет корректного никнейма.
 */
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

/**
 * Восстанавливает сессию из сохранённых данных, отбрасывая некорректных участников.
 *
 * @param value - Значение из хранилища.
 * @returns Сессия или `null`, если в записи нет идентификатора или списка игроков.
 */
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

/**
 * Восстанавливает статистику игрока из сохранённых данных.
 *
 * @param value - Значение из хранилища.
 * @returns Статистика или `null`, если обязательные поля повреждены.
 */
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

/**
 * Объединяет статистику одного игрока, оказавшуюся под разными ключами.
 *
 * @param current - Уже сохранённая статистика.
 * @param incoming - Статистика из повторной записи.
 * @returns Суммарное число игр и данные последней сессии.
 */
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

/**
 * Нормализует логины в истории и объединяет дубли, отбрасывая повреждённые записи.
 *
 * @param history - Сохранённый индекс истории игроков.
 * @returns Индекс с нормализованными ключами и без повреждённых записей.
 */
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

/**
 * Приводит сохранённое состояние к актуальной структуре и отбрасывает записи,
 * которые ломают отображение очереди и проверки кулдаунов.
 *
 * @param stored - Значение из хранилища.
 * @returns Валидное состояние очереди.
 */
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
