import { type FC } from 'react'
import { LuCrown, LuShield, LuMessageSquare, LuCpu } from 'react-icons/lu'
import { APP_LOG_STATUSES, APP_LOG_SOURCES, type AppLogItem } from '../types.ts'
import { APP_LOG_SOURCE_LABELS } from '../../../constants/app-logs.constants.ts'

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
    statusClassName = 'text-[color-mix(in_oklch,var(--color-success)_80%,black)] [:where([data-theme=dim])_&]:text-success font-medium'
  } else if (log.status === APP_LOG_STATUSES.WARNING) {
    statusClassName = 'text-[color-mix(in_oklch,var(--color-warning)_75%,black)] [:where([data-theme=dim])_&]:text-warning font-medium'
  } else if (log.status === APP_LOG_STATUSES.ERROR) {
    statusClassName = 'text-[color-mix(in_oklch,var(--color-error)_85%,black)] [:where([data-theme=dim])_&]:text-error font-medium'
  }

  let InitiatorIcon = LuCpu
  let tooltipText: string = APP_LOG_SOURCE_LABELS.APPLICATION

  if (log.source === APP_LOG_SOURCES.STREAMER_UI) {
    InitiatorIcon = LuCrown
    tooltipText = APP_LOG_SOURCE_LABELS.STREAMER_UI
  } else if (log.source === APP_LOG_SOURCES.CHAT_MODERATOR) {
    InitiatorIcon = LuShield
    tooltipText = APP_LOG_SOURCE_LABELS.CHAT_MODERATOR
  } else if (log.source === APP_LOG_SOURCES.CHAT_USER) {
    InitiatorIcon = LuMessageSquare
    tooltipText = APP_LOG_SOURCE_LABELS.CHAT_USER
  }

  return (
    <div className="py-0.5 border-b border-base-content/5 wrap-break-word text-sm leading-relaxed">
      <span className="text-base-content/40 select-none mr-1.5">
        [{timeString}]
      </span>

      <span
        className={'md:tooltip md:tooltip-top md:tooltip-sm'
                + ' text-base-content/50 inline-flex items-center align-middle mr-1.5 z-100'}
        data-tip={tooltipText}
      >
        <InitiatorIcon className="w-3.5 h-3.5" />
      </span>

      <span className="font-bold text-primary mr-1.5">
        {log.actorUsername}:
      </span>

      {log.rawCommand && (
        <span className="text-base-content/40 mr-1.5">
          «{log.rawCommand}»
        </span>
      )}

      <span className={statusClassName}>
        {log.message}
      </span>
    </div>
  )
}
