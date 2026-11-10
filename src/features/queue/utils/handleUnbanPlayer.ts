import type { QueueSettings } from '../../queue-settings/types.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

interface HandleUnbanPlayerArgs {
  /** Логин/никнейм пользователя для удаления из бан-листа */
  username: string;
  /** Источник вызова команды */
  source: AppLogItem['source'];
  /** Никнейм того, кто убрал из бана */
  actorUsername: string;
  /** Текущие настройки очереди */
  settings: QueueSettings;
  /** Функция обновления настроек */
  updateSettings: (newSettings: Partial<QueueSettings>) => void;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog']
}

/**
 * Удаляет игрока из внутреннего бан-листа настроек очереди.
 */
export const handleUnbanPlayer = ({
  username,
  source,
  actorUsername,
  settings,
  updateSettings,
  pushLog,
}: HandleUnbanPlayerArgs): void => {
  const targetLogin = username.toLowerCase()

  const isExist = settings.banList.some(b => b.toLowerCase() === targetLogin)

  if (!isExist) {
    pushLog({
      message: `Бан-лист очереди: Ошибка, ${username} не найден в бан-листе очереди.`,
      status: APP_LOG_STATUSES.ERROR,
      source,
      actorUsername,
    })
    return
  }

  const updatedBanList = settings.banList.filter(b => b.toLowerCase() !== targetLogin)
  updateSettings({ banList: updatedBanList })

  pushLog({
    message: `Бан-лист очереди: ${username} удален из бан-листа очереди.`,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
