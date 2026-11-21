import type { QueueState } from '../types'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'
import { QUEUE_JOIN_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { getQueueCooldownRestriction } from './getQueueCooldownRestriction.ts'

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
