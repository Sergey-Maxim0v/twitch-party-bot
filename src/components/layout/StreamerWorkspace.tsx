import { type FC, useEffect } from 'react'
import QueueSettingsPanel from '../../features/queue-settings/components/QueueSettingsPanel.tsx'
import { QueueSettingsProvider } from '../../features/queue-settings/context/QueueSettingsProvider.tsx'
import { QueueProvider } from '../../features/queue/context/QueueProvider.tsx'
import QueuePanel from '../../features/queue/components/QueuePanel.tsx'
import QueueLogsPanel from '../../features/app-logs/components/QueueLogsPanel.tsx'
import TwitchChat from '../../services/twitch/components/TwitchChat.tsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.ts'
import CollapsiblePanel from './panel/CollapsiblePanel.tsx'
import { useBreakpoint } from '../../hooks/useBreakpoint.ts'
import { getPanelDirections } from './panel/utils/getPanelDirections.ts'
import { BREAKPOINTS } from '../../hooks/types/breakpoint.types.ts'

const StreamerWorkspace: FC = () => {
  const [isOpenSettings, setIsOpenSettings] = useLocalStorage<boolean>('panel_settings_open', true)
  const [isOpenQueue, setIsOpenQueue] = useLocalStorage<boolean>('panel_queue_open', true)
  const [isOpenLogs, setIsOpenLogs] = useLocalStorage<boolean>('panel_logs_open', true)
  const [isOpenChat, setIsOpenChat] = useLocalStorage<boolean>('panel_chat_open', true)

  const currentBreakpoint = useBreakpoint()
  const directions = getPanelDirections(currentBreakpoint)

  useEffect(() => {
    if(currentBreakpoint === BREAKPOINTS.SM) {
      setIsOpenSettings(false)
      setIsOpenQueue(true)
      setIsOpenLogs(false)
      setIsOpenChat(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Нужно реагировать только на изменение брейкпоинта
  }, [currentBreakpoint])

  const panelStyle = 'flex-1 min-w-0 min-h-0'

  const settingsPanel = (
    <CollapsiblePanel
      className={panelStyle + ''}
      direction={directions.settings}
      isOpen={isOpenSettings}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenQueue(false)
          setIsOpenLogs(false)
          setIsOpenChat(false)
        }
        setIsOpenSettings(!isOpenSettings)
      }}
      title="Настройки очереди"
    >
      <QueueSettingsPanel />
    </CollapsiblePanel>
  )

  const queuePanel = (
    <CollapsiblePanel
      className={panelStyle + ''}
      direction={directions.queue}
      isOpen={isOpenQueue}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenLogs(false)
          setIsOpenChat(false)
        } 
        setIsOpenQueue(!isOpenQueue)
      }}
      title="Очередь"
    >
      <QueuePanel />
    </CollapsiblePanel>
  )

  const logsPanel = (
    <CollapsiblePanel
      className={panelStyle + ''}
      direction={directions.logs}
      isOpen={isOpenLogs}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenQueue(false)
          setIsOpenChat(false)
        } 
        setIsOpenLogs(!isOpenLogs)
      }}
      title="Логи очереди"
    >
      <QueueLogsPanel />
    </CollapsiblePanel>
  )

  const chatPanel = (
    <CollapsiblePanel
      className={panelStyle + ''}
      direction={directions.chat}
      isOpen={isOpenChat}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenQueue(false)
          setIsOpenLogs(false)
        }
        setIsOpenChat(!isOpenChat)
      }}
      title="Чат трансляции"
    >
      <TwitchChat />
    </CollapsiblePanel>
  )

  return (
    <QueueSettingsProvider>
      <QueueProvider>
        <div className="w-screen h-full flex justify-center bg-base-300 overflow-hidden">
          {/* Главный контейнер */}
          <div className="w-full h-full flex bg-base-100 overflow-hidden flex-col md:flex-row">

            {/* --- 1. МОБИЛЬНЫЙ РЕЖИМ (SM: <768px) --- */}
            {currentBreakpoint === BREAKPOINTS.SM && (
              <>
                {settingsPanel}
                {queuePanel}
                {logsPanel}
                {chatPanel}
              </>
            )}

            {/* --- 2. ПЛАНШЕТНЫЙ РЕЖИМ (MD / LG: 768px - 1279px) --- */}
            {(currentBreakpoint === BREAKPOINTS.MD || currentBreakpoint === BREAKPOINTS.LG) && (
              <>
                <div className="flex-1 h-full flex flex-col min-h-0">
                  {settingsPanel}
                  {queuePanel}
                </div>
                <div className="flex-1 h-full flex flex-col min-h-0">
                  {logsPanel}
                  {chatPanel}
                </div>
              </>
            )}

            {/* --- 3. НОУТБУК РЕЖИМ (XL: 1280px - 1535px) --- */}
            {currentBreakpoint === BREAKPOINTS.XL && (
              <>
                <div className="flex-1 h-full flex flex-col min-h-0">
                  {settingsPanel}
                  {logsPanel}
                </div>
                {queuePanel}
                {chatPanel}
              </>
            )}

            {/* --- 4. ДЕСКТОП РЕЖИМ (XXL: >=1536px) --- */}
            {currentBreakpoint === BREAKPOINTS.XXL && (
              <>
                {settingsPanel}
                {queuePanel}
                {logsPanel}
                {chatPanel}
              </>
            )}
          </div>
        </div>
      </QueueProvider>
    </QueueSettingsProvider>
  )
}

export default StreamerWorkspace
