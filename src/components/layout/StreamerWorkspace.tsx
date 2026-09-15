import type { FC } from 'react'
import QueueSettingsPanel from '../../features/queue-settings/components/QueueSettingsPanel.tsx'
import { QueueSettingsProvider } from '../../features/queue-settings/context/QueueSettingsProvider.tsx'
import { QueueProvider } from '../../features/queue/context/QueueProvider.tsx'
import QueuePanel from '../../features/queue/components/QueuePanel.tsx'
import QueueLogsPanel from '../../features/app-logs/components/QueueLogsPanel.tsx'
import TwitchChat from '../../services/twitch/components/TwitchChat.tsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.ts'
import CollapsiblePanel from './panel/CollapsiblePanel.tsx'

const StreamerWorkspace: FC = () => {
  const [isOpenSettings, setIsOpenSettings] = useLocalStorage<boolean>('queue_logs_open', true)
  const [isOpenQueue, setIsOpenQueue] = useLocalStorage<boolean>('queue_logs_open', true)
  const [isOpenLogs, setIsOpenLogs] = useLocalStorage<boolean>('queue_logs_open', true)
  const [isOpenChat, setIsOpenChat] = useLocalStorage<boolean>('queue_logs_open', true)

  const PANEL_CLASSNAME = 'h-full flex-1 w-83'
  const PANEL_CLASSNAME_COLLAPSED = 'w-12'

  return (
    <div className="w-screen h-full flex justify-center
        bg-base-300 overflow-hidden"
    >
      <div className="w-full h-full flex flex-row bg-base-100
            overflow-hidden"
      >
        <QueueSettingsProvider>
          <QueueProvider>
            <CollapsiblePanel
              className={PANEL_CLASSNAME}
              collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
              isOpen={isOpenSettings}
              onToggle={() => { setIsOpenSettings(!isOpenSettings) }}
              title="Настройки очереди"
            >
              <QueueSettingsPanel />
            </CollapsiblePanel>

            <CollapsiblePanel
              className={PANEL_CLASSNAME}
              collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
              isOpen={isOpenQueue}
              onToggle={() => { setIsOpenQueue(!isOpenQueue) }}
              title="Очередь"
            >
              <QueuePanel />
            </CollapsiblePanel>
          </QueueProvider>

          <CollapsiblePanel
            className={PANEL_CLASSNAME}
            collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
            isOpen={isOpenLogs}
            onToggle={() => { setIsOpenLogs(!isOpenLogs) }}
            title="Логи очереди"
          >
            <QueueLogsPanel />
          </CollapsiblePanel>
        </QueueSettingsProvider>

        <CollapsiblePanel
          className={PANEL_CLASSNAME}
          collapsedClassName={PANEL_CLASSNAME_COLLAPSED}
          isOpen={isOpenChat}
          onToggle={() => { setIsOpenChat(!isOpenChat) }}
          title="Чат трансляции"
        >
          <TwitchChat />
        </CollapsiblePanel>
      </div>
    </div>
  )
}

export default StreamerWorkspace
