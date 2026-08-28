import { type FC } from 'react'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import CollapsiblePanel from '../../../components/layout/panel/CollapsiblePanel.tsx'
import { QueueCommandsSection } from './QueueCommandsSection.tsx'
import { QueueBanListSection } from './QueueBanListSection.tsx'
import { QueueGameSection } from './QueueGameSection.tsx'
import QueueGeneralSettings from './QueueGeneralSettings.tsx'
import QueueResetSettings from './QueueResetSection.tsx'
import { useQueueAutoClose } from '../hooks/useQueueAutoClose.ts'
import QueueMessageSection from './QueueMessageSection.tsx'
import QueueClearSection from './QueueClearSection.tsx'

export interface QueueSettingsProps {
  className?: string;
  collapsedClassName?: string;
}

const QueueSettingsPanel: FC<QueueSettingsProps> = ({
  className = '',
  collapsedClassName = '',
}) => {
  const [isOpen, setIsOpen] = useLocalStorage<boolean>('queue_settings_open', true)

  useQueueAutoClose()

  const titleClassName = 'text-xs font-bold tracking-wide text-base-content/50 uppercase'

  return (
    <CollapsiblePanel
      className={className}
      collapsedClassName={collapsedClassName}
      isOpen={isOpen}
      onToggle={() => { setIsOpen(!isOpen) }}
      title="Настройки очереди"
    >
      <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar min-w-0">

        <QueueGeneralSettings titleClassName={titleClassName} />

        <QueueClearSection titleClassName={titleClassName} />

        <QueueGameSection titleClassName={titleClassName} />

        <QueueCommandsSection titleClassName={titleClassName} />

        <QueueMessageSection titleClassName={titleClassName} />

        <QueueBanListSection titleClassName={titleClassName} />

        <QueueResetSettings titleClassName={titleClassName} />
      </div>
    </CollapsiblePanel>
  )
}

export default QueueSettingsPanel
