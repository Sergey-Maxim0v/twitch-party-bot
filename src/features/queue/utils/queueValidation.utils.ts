import { APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import type { QueueGameConfig, QueueGameKey, QueueSettings } from '../../queue-settings/types.ts'
import type { QueueState } from '../types.ts'
import {
  QUEUE_GAME_NICKNAME_PATTERNS,
  QUEUE_INVALID_GAME_PATTERN_LOG,
  QUEUE_JOIN_LOG_MESSAGES,
  QUEUE_NICKNAME_MAX_LENGTH,
} from '../../../constants/queue.constants.ts'
import { TWITCH_CHAT_MENTION_REGEX } from '../../../constants/twitch.constants.ts'
import { getOwnValue } from '../../../utils/objects.ts'
import { normalizeQueueUsername } from './queuePlayers.utils.ts'

export type QueueCooldownSettings = Pick<
  QueueSettings,
  'gamesPlayedCooldown' | 'maxGamesPerUser' | 'sessionHistoryCooldown'
>

export type QueueCooldownRestriction =
  | { type: 'gamesLimit'; gamesPlayed: number; maxGames: number }
  | { type: 'timeCooldown'; remainingMinutes: number }
  | { type: 'gamesCooldown'; remainingGames: number }

interface ValidateQueueEntryArgs {
  isQueueOpen: QueueContextValue['isQueueOpen'];
  username: string;
  isPrivileged: boolean;
  state: QueueState;
  settings: QueueSettings;
  source: LogSource;
}

interface GetQueueCooldownRestrictionArgs {
  username: string;
  state: QueueState;
  settings: QueueCooldownSettings;
  now?: number;
}

interface ExtractGameNicknameArgs {
  rawMessage: string;
  gameConfig?: QueueGameConfig;
  commandNames: readonly string[];
}

const MILLISECONDS_IN_MINUTE = 60_000

/** Скомпилированные правила проверки никнейма по ключу игры. */
const gameRegexes = new Map<QueueGameKey, RegExp>()

export const validateQueueEntry = ({
  isQueueOpen,
  username,
  isPrivileged,
  state,
  settings,
  source,
}: ValidateQueueEntryArgs): string | null => {
  // Стример, модераторы и приложение обходят базовые ограничения очереди.
  const isStaff = source === APP_LOG_SOURCES.APPLICATION
      || source === APP_LOG_SOURCES.CHAT_MODERATOR
      || source === APP_LOG_SOURCES.STREAMER_UI

  if (isStaff) return null

  const isBanned = settings.banList.some(b => b.toLowerCase() === username.toLowerCase())
  if (isBanned) {
    return QUEUE_JOIN_LOG_MESSAGES.DENIED_BANNED(username)
  }

  if (!isQueueOpen) {
    return QUEUE_JOIN_LOG_MESSAGES.DENIED_CLOSED()
  }

  if (settings.subscribersOnly && !isPrivileged) {
    return QUEUE_JOIN_LOG_MESSAGES.DENIED_SUBSCRIBERS_ONLY()
  }

  const restriction = getQueueCooldownRestriction({ username, state, settings })

  if (!restriction) return null

  if (restriction.type === 'gamesLimit') {
    return QUEUE_JOIN_LOG_MESSAGES.DENIED_MAX_GAMES(
      username,
      restriction.gamesPlayed,
      restriction.maxGames,
    )
  }

  if (restriction.type === 'timeCooldown') {
    return QUEUE_JOIN_LOG_MESSAGES.DENIED_TIME_COOLDOWN(restriction.remainingMinutes)
  }

  return QUEUE_JOIN_LOG_MESSAGES.DENIED_GAMES_COOLDOWN(restriction.remainingGames)
}

export const getQueueCooldownRestriction = ({
  username,
  state,
  settings,
  now = Date.now(),
}: GetQueueCooldownRestrictionArgs): QueueCooldownRestriction | null => {
  const playerStats = getOwnValue(state.playerHistory, normalizeQueueUsername(username))

  if (!playerStats) return null

  const { gamesPlayedCooldown, maxGamesPerUser = 0, sessionHistoryCooldown } = settings

  if (maxGamesPerUser > 0 && playerStats.gamesPlayed >= maxGamesPerUser) {
    return { type: 'gamesLimit', gamesPlayed: playerStats.gamesPlayed, maxGames: maxGamesPerUser }
  }

  const minutesPassed = (now - playerStats.lastPlayedTimestamp) / MILLISECONDS_IN_MINUTE

  if (sessionHistoryCooldown > 0 && minutesPassed < sessionHistoryCooldown) {
    return { type: 'timeCooldown', remainingMinutes: Math.ceil(sessionHistoryCooldown - minutesPassed) }
  }

  const sessionsPassed = state.globalSessionCounter - playerStats.lastPlayedSessionNumber

  if (gamesPlayedCooldown > 0 && sessionsPassed < gamesPlayedCooldown) {
    return { type: 'gamesCooldown', remainingGames: gamesPlayedCooldown - sessionsPassed }
  }

  return null
}

const getGameRegex = (key: QueueGameKey): RegExp | null => {
  const cachedRegex = gameRegexes.get(key)
  if (cachedRegex) return cachedRegex

  const pattern = QUEUE_GAME_NICKNAME_PATTERNS[key]
  if (!pattern) return null

  try {
    const regex = new RegExp(pattern)
    gameRegexes.set(key, regex)

    return regex
  } catch (error) {
    console.error(QUEUE_INVALID_GAME_PATTERN_LOG, error)
    return null
  }
}

/** Сканирует сообщение и извлекает первый никнейм, строго соответствующий правилу выбранной игры. */
export const extractGameNickname = ({
  rawMessage,
  gameConfig,
  commandNames,
}: ExtractGameNicknameArgs): string | null => {
  if (!gameConfig) return null

  const regex = getGameRegex(gameConfig.key)
  if (!regex) return null

  const words = rawMessage.trim().split(/\s+/)
  const firstWord = words[0]
  if (!firstWord) return null

  const normalizedFirstWord = firstWord.toLowerCase()
  const isCommand = commandNames.some(name => name.toLowerCase() === normalizedFirstWord)
  const candidates = isCommand ? words.slice(1) : words

  for (const word of candidates) {
    if (word.length <= QUEUE_NICKNAME_MAX_LENGTH && regex.test(word)) {
      return word
    }
  }

  return null
}

export const parseCommandTarget = (argument: string): string =>
  argument.trim().replace(TWITCH_CHAT_MENTION_REGEX, '').trim()
