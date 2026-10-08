import type { QueueState } from '../types'
import type { QueueSettings } from '../../queue-settings/types.ts'
import { LOG_SOURCE, type LogSource } from '../../app-logs/types.ts'
import type { QueueContextValue } from '../context/QueueInstance.ts'

interface ValidateQueueEntryArgs {
  isQueueOpen: QueueContextValue['isQueueOpen'];
  userId: string;
  username: string;
  isPrivileged: boolean;
  state: QueueState;
  settings: QueueSettings;
  source: LogSource;
}

/**
 * Проверяет игрока на соответствие всем правилам и ограничениям настроек очереди.
 * @returns {string | null} Текст ошибки валидации или null, если проверка пройдена
 */
export const validateQueueEntry = ({
  isQueueOpen,
  userId,
  username,
  isPrivileged,
  state,
  settings,
  source,
}: ValidateQueueEntryArgs): string | null => {
  // 1. Проверка: Локальный бан-лист фичи (Абсолютное ограничение для всех источников)
  const isBanned = settings.banList.some(b => b.toLowerCase() === username.toLowerCase())
  if (isBanned) {
    return 'Добавление в очередь: Отклонено, пользователь находится в бан-листе очереди'
  }

  // Стример, модераторы и система обходят остальные базовые правила (закрытую очередь, sub-only и кулдауны)
  const isStaff = source === LOG_SOURCE.APPLICATION
      || source === LOG_SOURCE.CHAT_MODERATOR
      || source === LOG_SOURCE.STREAMER_UI

  if (isStaff) return null

  // 2. Проверка: Открыта ли очередь
  if (!isQueueOpen) {
    return 'Добавление в очередь: Отклонено, очередь закрыта'
  }

  // 3. Проверка: Только для подписчиков (subscribersOnly)
  if (settings.subscribersOnly && !isPrivileged) {
    return 'Добавление в очередь: Отклонено, доступ к очереди только для подписчиков Twitch, VIP и модераторов '
  }

  // 4. Проверка кулдаунов (из playerHistory)
  const playerStats = state.playerHistory[userId]
  if (playerStats) {
    const currentTimestamp = Date.now()

    // А) Временной кулдаун (sessionHistoryCooldown в минутах)
    if (settings.sessionHistoryCooldown > 0) {
      const minutesPassed = (currentTimestamp - playerStats.lastPlayedTimestamp) / 60000
      if (minutesPassed < settings.sessionHistoryCooldown) {
        const remaining = Math.ceil(settings.sessionHistoryCooldown - minutesPassed)
        return `Добавление в очередь: Отклонено, кулдаун времени (осталось ${remaining} мин.)`
      }
    }

    // Б) Сессионный кулдаун (gamesPlayedCooldown по количеству закрытых очередей)
    if (settings.gamesPlayedCooldown > 0) {
      const sessionsPassed = state.globalSessionCounter - playerStats.lastPlayedSessionNumber
      if (sessionsPassed < settings.gamesPlayedCooldown) {
        const remaining = settings.gamesPlayedCooldown - sessionsPassed
        return `Добавление в очередь: Отклонено, кулдаун сыгранных игр (пропустите еще сессий: ${remaining})`
      }
    }
  }

  return null
}
