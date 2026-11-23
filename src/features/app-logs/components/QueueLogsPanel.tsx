import { type FC } from 'react'
import { QueueLogsElement } from './QueueLogsElement.tsx'
import { useAppLogs } from '../hooks/useAppLogs.ts'

/**
 * Панель для отображения очереди логов в интерфейсе.
 */
export const QueueLogsPanel: FC = () => {

  const { logs } = useAppLogs()

  return (
    <div
      className="mb-10 flex h-0 flex-1 flex-col-reverse justify-start gap-1 overflow-x-hidden overflow-y-auto
                overscroll-contain rounded-2xl bg-base-300/30 p-2 font-mono text-xs
                [scrollbar-color:color-mix(in_oklch,var(--color-base-content)_25%,transparent)_transparent]
                [scrollbar-gutter:stable] [scrollbar-width:thin]"
    >
      {logs.map(log => (
        <QueueLogsElement key={log.id} log={log} />
      ))}
    </div>
  )
}
