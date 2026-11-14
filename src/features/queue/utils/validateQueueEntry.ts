import type { QueueState } from '../types'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { getOwnValue } from '../../../utils/objects.ts'

/** Количество миллисекунд в минуте. */
const MILLISECONDS_IN_MINUTE = 60_000

/** Данные, необходимые для проверки заявки игрока. */
interface ValidateQueueEntryArgs {
  /** Текущий статус очереди. */
  isQueueOpen: QueueContextValue['isQueueOpen'];
  /** Логин проверяемого игрока. */
  username: string;
  /** Признак подписчика, VIP или модератора. */
  isPrivileged: boolean;
  /** Текущее состояние очереди. */
  state: QueueState;
  /** Настройки очереди. */
  settings: QueueSettings;
  /** Источник вызова команды. */
  source: LogSource;
}

/**
 * Проверяет заявку игрока по правилам очереди: бан-лист, статус очереди,
 * sub-only режим, лимит игр и кулдауны.
 *
 * @returns Текст ошибки валидации или `null`, если проверка пройдена.
 */
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
    return 'Добавление в очередь: Отклонено, игрок находится в бан-листе очереди'
  }

  if (!isQueueOpen) {
    return 'Добавление в очередь: Отклонено, очередь закрыта'
  }

  if (settings.subscribersOnly && !isPrivileged) {
    return 'Добавление в очередь: Отклонено, доступ к очереди только для подписчиков Twitch, VIP и модераторов '
  }

  const playerStats = getOwnValue(state.playerHistory, username)

  if (!playerStats) {
    return null
  }

  const { gamesPlayedCooldown, maxGamesPerUser = 0, sessionHistoryCooldown } = settings
  const isGamesLimitReached = maxGamesPerUser > 0 && playerStats.gamesPlayed >= maxGamesPerUser

  if (isGamesLimitReached) {
    return `Добавление в очередь: Отклонено, игрок ${username} уже сыграл максимальное количество игр (${playerStats.gamesPlayed}/${maxGamesPerUser})`
  }

  const minutesPassed = (Date.now() - playerStats.lastPlayedTimestamp) / MILLISECONDS_IN_MINUTE
  const isTimeCooldownActive = sessionHistoryCooldown > 0 && minutesPassed < sessionHistoryCooldown

  if (isTimeCooldownActive) {
    const remaining = Math.ceil(sessionHistoryCooldown - minutesPassed)
    return `Добавление в очередь: Отклонено, кулдаун времени (осталось ${remaining} мин.)`
  }

  const sessionsPassed = state.globalSessionCounter - playerStats.lastPlayedSessionNumber
  const isGamesCooldownActive = gamesPlayedCooldown > 0 && sessionsPassed < gamesPlayedCooldown

  if (isGamesCooldownActive) {
    const remaining = gamesPlayedCooldown - sessionsPassed
    return `Добавление в очередь: Отклонено, кулдаун сыгранных игр (необходимо пропустить еще ${remaining} игр)`
  }

  return null
}
