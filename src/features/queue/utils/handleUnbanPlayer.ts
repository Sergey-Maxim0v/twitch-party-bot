import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { HandleBanPlayerArgs } from './handleBanPlayer.ts'

/** Аргументы разбана совпадают с баном, кроме отображаемого имени. */
type HandleUnbanPlayerArgs = Omit<HandleBanPlayerArgs, 'displayedUsername'>

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
