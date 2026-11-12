import { type FC, type ReactNode, useState, useCallback, useMemo } from 'react'
import { AppLogsContext } from './AppLogsInstance.ts'
import { APP_LOG_STATUSES, type AppLogItem } from '../types.ts'
import { AppLogsConsumerWrapper } from '../components/AppLogsConsumerWrapper.tsx'
import { createId } from '../../../utils/createId.ts'

interface AppLogsProviderProps {
  children: ReactNode;
}

/**
 * Провайдер контекста логов приложения: хранит очередь логов
 * и предоставляет методы для чтения, записи и очистки.
 */
export const AppLogsProvider: FC<AppLogsProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<AppLogItem[]>([])

  const pushLog = useCallback(({
    message,
    status = APP_LOG_STATUSES.INFO,
    source,
    actorUsername,
    rawCommand,
  }: {
    message: AppLogItem['message'];
    status?: AppLogItem['status'];
    source: AppLogItem['source'];
    actorUsername: AppLogItem['actorUsername'];
    rawCommand?: AppLogItem['rawCommand'];
  }) => {
    const newLog: AppLogItem = {
      id: createId('log'),
      timestamp: Date.now(),
      source,
      actorUsername,
      rawCommand,
      message,
      status,
    }

    setTimeout(() => {
      setLogs(prev => [newLog, ...prev].slice(0, 1000))
    }, 0)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const value = useMemo(() => ({ logs, pushLog, clearLogs }), [logs, pushLog, clearLogs])

  return (
    <AppLogsContext.Provider value={value}>
      <AppLogsConsumerWrapper>
        {children}
      </AppLogsConsumerWrapper>
    </AppLogsContext.Provider>
  )
}
