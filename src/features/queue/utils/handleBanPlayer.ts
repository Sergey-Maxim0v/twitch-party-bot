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

export interface HandleBanPlayerResult {
  /** Флаг, указывающий, был ли успешно добавлен пользователь в бан-лист */
  isBanned: boolean;
}

/**
 * Хендлер для добавления игрока во внутренний бан-лист настроек очереди.
 */
export const handleBanPlayer = ({
  username,
  displayedUsername,
  source,
  actorUsername,
  settings,
  updateSettings,
  pushLog,
}: HandleBanPlayerArgs): HandleBanPlayerResult => {
  const targetLogin = username.toLowerCase()
  const displayName = displayedUsername || username

  // 1. Проверяем, нет ли уже пользователя в бан-листе настроек
  const alreadyBanned = settings.banList.some(b => b.toLowerCase() === targetLogin)

  const pushBanlistLog = (message: string) => {
    pushLog({
      message,
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })
  }

  if (alreadyBanned) {
    pushBanlistLog(`Бан-лист очереди: ${displayName} уже находится в бан-листе.`)

    return { isBanned: false }
  }

  // 2. Обновляем бан-лист в настройках очереди (добавляем оригинальный никнейм)
  const updatedBanList = [...settings.banList, username]
  updateSettings({ banList: updatedBanList })

  // 3. Отправляем лог о внесении пользователя в бан-лист
  pushBanlistLog(`Бан-лист очереди: ${displayName} добавлен.`)

  return { isBanned: true }
}
