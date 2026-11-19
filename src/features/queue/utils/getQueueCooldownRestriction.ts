import type { QueueSettings } from '../../queue-settings/types.ts'
import type { QueueState } from '../types.ts'
import { getOwnValue } from '../../../utils/objects.ts'

/** Настройки, влияющие на повторное участие игрока. */
export type QueueCooldownSettings = Pick<
  QueueSettings,
  'gamesPlayedCooldown' | 'maxGamesPerUser' | 'sessionHistoryCooldown'
>

/** Причина, по которой игрок не может повторно участвовать в очереди. */
export type QueueCooldownRestriction =
  | { type: 'gamesLimit'; gamesPlayed: number; maxGames: number }
  | { type: 'timeCooldown'; remainingMinutes: number }
  | { type: 'gamesCooldown'; remainingGames: number }

interface GetQueueCooldownRestrictionArgs {
  /** Логин проверяемого игрока. */
  username: string;
  /** Текущее состояние очереди. */
  state: QueueState;
  /** Настройки кулдаунов и лимита игр. */
  settings: QueueCooldownSettings;
  /** Текущее время в миллисекундах. */
  now?: number;
}

/** Количество миллисекунд в минуте. */
const MILLISECONDS_IN_MINUTE = 60_000

/**
 * Определяет действующее для игрока ограничение на повторное участие:
 * лимит игр, кулдаун по времени или кулдаун по сыгранным играм.
 *
 * @returns Причина ограничения или `null`, если игрок может участвовать.
 */
export const getQueueCooldownRestriction = ({
  username,
  state,
  settings,
  now = Date.now(),
}: GetQueueCooldownRestrictionArgs): QueueCooldownRestriction | null => {
  const playerStats = getOwnValue(state.playerHistory, username)

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
