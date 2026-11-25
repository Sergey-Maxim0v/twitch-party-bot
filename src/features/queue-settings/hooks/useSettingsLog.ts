import { useCallback } from 'react'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import { APP_LOG_STATUSES, type AppLogStatus, APP_LOG_SOURCES, type LogSource } from '../../app-logs/types.ts'
import { useActorUsername } from '../../auth/hooks/useActorUsername.ts'
import { QUEUE_SETTINGS_FALLBACKS } from '../../../constants/queue.constants.ts'

/** Аргументы записи о действии с настройками очереди. */
export interface SettingsLogArgs {
  message: string;
  status?: AppLogStatus;
  source?: LogSource;
  actorUsername?: string;
}

/** Возвращает функцию записи действия с настройками в журнал приложения. */
export const useSettingsLog = () => {
  const logUserName = useActorUsername(QUEUE_SETTINGS_FALLBACKS.ACTOR)
  const { pushLog } = useAppLogs()

  return useCallback(({
    message,
    status = APP_LOG_STATUSES.WARNING,
    source = APP_LOG_SOURCES.STREAMER_UI,
    actorUsername = logUserName,
  }: SettingsLogArgs) => {
    pushLog({ message, status, source, actorUsername })
  }, [logUserName, pushLog])
}
