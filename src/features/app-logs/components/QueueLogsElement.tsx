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

  let statusClassName = 'bg-base-200/50 hover:bg-base-200/90'

  if (log.status === APP_LOG_STATUSES.SUCCESS) {
    statusClassName = 'bg-success/15 hover:bg-success/20 [:where([data-theme=dim])_&]:bg-success/5 [:where([data-theme=dim])_&]:hover:bg-success/10'
  } else if (log.status === APP_LOG_STATUSES.WARNING) {
    statusClassName = 'bg-warning/15 hover:bg-warning/20 [:where([data-theme=dim])_&]:bg-warning/5 [:where([data-theme=dim])_&]:hover:bg-warning/10'
  } else if (log.status === APP_LOG_STATUSES.ERROR) {
    statusClassName = 'bg-error/15 hover:bg-error/20 [:where([data-theme=dim])_&]:bg-error/5 [:where([data-theme=dim])_&]:hover:bg-error/10'
  }

  let InitiatorIcon = LuCpu
  let tooltipText: string = APP_LOG_SOURCE_LABELS.APPLICATION
  let iconToneClassName = 'text-base-content/45'

  if (log.source === APP_LOG_SOURCES.STREAMER_UI) {
    InitiatorIcon = LuCrown
    tooltipText = APP_LOG_SOURCE_LABELS.STREAMER_UI
    iconToneClassName = 'text-primary'
  } else if (log.source === APP_LOG_SOURCES.CHAT_MODERATOR) {
    InitiatorIcon = LuShield
    tooltipText = APP_LOG_SOURCE_LABELS.CHAT_MODERATOR
    iconToneClassName = 'text-info'
  } else if (log.source === APP_LOG_SOURCES.CHAT_USER) {
    InitiatorIcon = LuMessageSquare
    tooltipText = APP_LOG_SOURCE_LABELS.CHAT_USER
    iconToneClassName = 'text-secondary'
  }

  return (
    <div
      className={
        'flex items-start gap-2 rounded-xl px-2 py-1.5 text-[13px] leading-relaxed text-base-content '
        + 'motion-safe:transition-colors motion-safe:duration-150 '
        + statusClassName
      }
    >
      <time className="mt-0.5 shrink-0 text-[11px] leading-4 tabular-nums tracking-tight text-base-content/40 select-none">
        {timeString}
      </time>

      <span
        className={
          'md:tooltip md:tooltip-right md:tooltip-sm z-100 mt-px inline-flex size-6 shrink-0 items-center '
          + 'justify-center rounded-md bg-base-content/6 '
          + iconToneClassName
        }
        data-tip={tooltipText}
      >
        <InitiatorIcon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1 wrap-break-word">
        <span className="mr-1.5 font-semibold">
          {log.actorUsername}:
        </span>

        {log.rawCommand && (
          <span
            className="mr-1.5 inline-block rounded-md bg-base-content/5 px-1.5 py-px align-middle
                       font-mono text-[11px] text-base-content/50"
          >
            «{log.rawCommand}»
          </span>
        )}

        <span>
          {log.message}
        </span>
      </div>
    </div>
  )
}
