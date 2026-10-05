import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleBanPlayerArgs {
  /** Логин/никнейм пользователя для занесения в бан-лист */
  username: string;
  /** Красивое отображаемое имя (для логов) */
  displayedUsername?: string;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто выдал бан */
  actorUsername: string;
  /** Текущие настройки очереди */
  settings: QueueSettings;
  /** Функция обновления настроек */
  updateSettings: (newSettings: Partial<QueueSettings>) => void;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog']
}

/**
 * Хендлер для добавления игрока во внутренний бан-лист настроек очереди.
 * Делегирует последующее удаление из списков специализированной утилите.
 */
export const handleBanPlayer = ({
  username,
  displayedUsername,
  source,
  actorUsername,
  settings,
  updateSettings,
  pushLog,
}: HandleBanPlayerArgs): void => {
  const targetLogin = username.toLowerCase()
  const displayName = displayedUsername || username

  // 1. Проверяем, нет ли уже пользователя в бан-листе настроек
  const alreadyBanned = settings.banList.some(b => b.toLowerCase() === targetLogin)

  if (alreadyBanned) {
    pushLog({
      message: `Ошибка бана: пользователь ${displayName} уже находится в бан-листе очереди.`,
      status: APP_LOG_STATUSES.ERROR,
      source,
      actorUsername,
    })
    return
  }

  // 2. Обновляем бан-лист в настройках очереди (добавляем оригинальный никнейм)
  const updatedBanList = [...settings.banList, username]
  updateSettings({ banList: updatedBanList })

  // 3. Отправляем лог о внесении пользователя в бан-лист
  pushLog({
    message: `Пользователь ${displayName} добавлен во внутренний бан-лист очереди.`,
    status: APP_LOG_STATUSES.SUCCESS,
    source,
    actorUsername,
  })
}
