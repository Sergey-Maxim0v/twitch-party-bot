import { type FC } from 'react'
import { QueueCommandsSection } from './QueueCommandsSection.tsx'
import { QueueBanListSection } from './QueueBanListSection.tsx'
import { QueueGameSection } from './QueueGameSection.tsx'
import { QueueGeneralSettings } from './QueueGeneralSettings.tsx'
import { QueueResetSection } from './QueueResetSection.tsx'
import { QueueMessageSection } from './QueueMessageSection.tsx'
import { QueueClearSection } from './QueueClearSection.tsx'
import { usePanelSettingsLog } from '../hooks/usePanelSettingsLog.ts'

/**
 * Панель настроек очереди.
 */
export const QueueSettingsPanel: FC = () => {
  usePanelSettingsLog()

  const titleClassName = 'text-xs font-bold tracking-wide text-base-content/50 uppercase'

  return (
    <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar min-w-0">
      <QueueGeneralSettings titleClassName={titleClassName} />
      <QueueClearSection titleClassName={titleClassName} />
      <QueueGameSection titleClassName={titleClassName} />
      <QueueCommandsSection titleClassName={titleClassName} />
      <QueueMessageSection titleClassName={titleClassName} />
      <QueueBanListSection titleClassName={titleClassName} />
      <QueueResetSection titleClassName={titleClassName} />
    </div>
  )
}
