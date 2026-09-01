import { type FC } from 'react'
import { LuCrown, LuShield, LuMessageSquare, LuCpu } from 'react-icons/lu'
import { APP_LOG_STATUSES, LOG_SOURCE, type AppLogItem } from '../types.ts'

interface QueueLogsElementProps {
  log: AppLogItem;
}

/**
 * Атомарный компонент для отображения одного элемента лога.
 */
export const QueueLogsElement: FC<QueueLogsElementProps> = ({ log }) => {
  const timeString = new Date(log.timestamp).toLocaleTimeString()

  let statusClassName = 'text-base-content'

  if (log.status === APP_LOG_STATUSES.SUCCESS) {
    statusClassName = 'text-success'
  } else if (log.status === APP_LOG_STATUSES.WARNING) {
    statusClassName = 'text-warning'
  } else if (log.status === APP_LOG_STATUSES.ERROR) {
    statusClassName = 'text-error'
  }

  // Определение иконки и текста всплывающей подсказки
  let InitiatorIcon = LuCpu
  let tooltipText = 'Системное действие'

  if (log.source === LOG_SOURCE.STREAMER_UI) {
    InitiatorIcon = LuCrown
    tooltipText = 'Действие стримера в интерфейсе'
  } else if (log.source === LOG_SOURCE.CHAT_MODERATOR) {
    InitiatorIcon = LuShield
    tooltipText = 'Команда модератора из чата'
  } else if (log.source === LOG_SOURCE.CHAT_USER) {
    InitiatorIcon = LuMessageSquare
    tooltipText = 'Запрос зрителя из чата'
  }

  return (
    <div className="py-0.5 border-b border-base-content/5 wrap-break-word text-sm leading-relaxed">
      <span className="text-base-content/40 select-none mr-1.5">
        [{timeString}]
      </span>

      <span
        className="tooltip tooltip-right tooltip-sm text-base-content/50 inline-flex items-center align-middle mr-1.5"
        data-tip={tooltipText}
      >
        <InitiatorIcon className="w-3.5 h-3.5" />
      </span>

      <span className="font-bold text-primary mr-1.5">
        {log.actorUsername}:
      </span>

      <span className={statusClassName}>
        {log.message}
        {log.rawCommand && (
          <span className="text-base-content/30 italic text-xs ml-1.5 select-all">
            ({log.rawCommand})
          </span>
        )}
      </span>
    </div>
  )
}

export default QueueLogsElement
