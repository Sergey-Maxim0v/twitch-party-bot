import { createContext } from 'react'
import type { AppLogItem, AppLogStatus, LogSource } from '../types.ts'

export interface AppLogsContextValue {
  logs: AppLogItem[];
  pushLog: (args: {
    message: string;
    status?: AppLogStatus;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => void;
  clearLogs: () => void;
}

export const AppLogsContext = createContext<AppLogsContextValue | null>(null)
