import { createContext } from 'react'
import type { AppLogItem, AppLogStatus, LogSource } from '../types.ts'

/**
 * Значение контекста логов приложения: очередь логов и методы управления ею.
 */
export interface AppLogsContextValue {
  /** Текущая очередь логов */
  logs: AppLogItem[];
  /** Добавляет новый лог в очередь */
  pushLog: (args: {
    message: string;
    status?: AppLogStatus;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => void;
  /** Очищает очередь логов */
  clearLogs: () => void;
}

export const AppLogsContext = createContext<AppLogsContextValue | null>(null)
