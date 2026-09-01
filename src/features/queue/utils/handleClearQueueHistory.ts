import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import { APP_LOG_STATUSES, type AppLogItem } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'

export interface HandleClearQueueHistoryArgs {
  /** Функция обновления состояния */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Источник вызова команды (чат/интерфейс) */
  source: AppLogItem['source'];
  /** Никнейм того, кто очистил историю */
  actorUsername: string;
  /** Хелпер провайдера для записи логов */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Хендлер для полной очистки истории сыгранных сессий (составов).
 */
export const handleClearQueueHistory = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: HandleClearQueueHistoryArgs): void => {
  setState(prev => ({
    ...prev,
    queueHistory: [],
  }))

  pushLog({
    message: 'История сыгранных сессий очищена.',
    status: APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
  },
  )
}
