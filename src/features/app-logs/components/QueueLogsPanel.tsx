import { type FC } from 'react'
import QueueLogsElement from '../../app-logs/components/QueueLogsElement.tsx'
import { useAppLogs } from '../hooks/useAppLogs.ts'

const QueueLogsPanel: FC = () => {

  const { logs } = useAppLogs()

  return (
    <div
      className="flex flex-col-reverse justify-start gap-1 p-4 mb-10 flex-1 h-0 overflow-x-hidden overflow-y-auto
                font-mono text-xs"
    >
      {logs.map(log => (
        <QueueLogsElement key={log.id} log={log} />
      ))}
    </div>
  )
}

export default QueueLogsPanel
