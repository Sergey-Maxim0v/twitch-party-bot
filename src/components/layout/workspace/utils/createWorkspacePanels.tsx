import { type Breakpoint, BREAKPOINTS } from '../../../../hooks/types/breakpoint.types.ts'
import CollapsiblePanel from '../../panel/CollapsiblePanel.tsx'
import QueueSettingsPanel from '../../../../features/queue-settings/components/QueueSettingsPanel.tsx'
import QueueLogsPanel from '../../../../features/app-logs/components/QueueLogsPanel.tsx'
import QueuePanel from '../../../../features/queue/components/QueuePanel.tsx'
import TwitchChat from '../../../../services/twitch/components/TwitchChat.tsx'
import type { WorkspaceDirections } from '../../panel/utils/getPanelDirections.ts'

export interface CreateWorkspacePanelProps {
  panelStyle: string
  directions: WorkspaceDirections
  currentBreakpoint: Breakpoint
  isOpenSettings: boolean
  isOpenQueue: boolean
  isOpenLogs: boolean
  isOpenChat: boolean
  setIsOpenSettings: (isOpen: boolean) => void
  setIsOpenLogs: (isOpen: boolean) => void
  setIsOpenQueue: (isOpen: boolean) => void
  setIsOpenChat: (isOpen: boolean) => void
}

export const createWorkspacePanels = ({
  panelStyle,
  directions,
  currentBreakpoint,
  isOpenSettings,
  isOpenQueue,
  isOpenLogs,
  isOpenChat,
  setIsOpenSettings,
  setIsOpenLogs,
  setIsOpenQueue,
  setIsOpenChat,
}: CreateWorkspacePanelProps) => {
  const settingsPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.settings}
      isOpen={isOpenSettings}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(!isOpenSettings)
          setIsOpenLogs(false)
          setIsOpenQueue(false)
          setIsOpenChat(false)
        } else if (currentBreakpoint === BREAKPOINTS.MD && isOpenSettings && !isOpenQueue ) {
          setIsOpenSettings(false)
          setIsOpenQueue(true)
        } else if (currentBreakpoint === BREAKPOINTS.LG && isOpenSettings && !isOpenQueue) {
          setIsOpenSettings(false)
          setIsOpenQueue(true)
        } else if (currentBreakpoint === BREAKPOINTS.XL && isOpenSettings && !isOpenLogs ) {
          setIsOpenSettings(false)
          setIsOpenLogs(true)
        } else {
          setIsOpenSettings(!isOpenSettings)
        }
      }}
      title="Настройки очереди"
    >
      <QueueSettingsPanel />
    </CollapsiblePanel>
  )

  const logsPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.logs}
      isOpen={isOpenLogs}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenLogs(!isOpenLogs)
          setIsOpenQueue(false)
          setIsOpenChat(false)
        } else if (currentBreakpoint === BREAKPOINTS.MD && isOpenLogs && !isOpenChat) {
          setIsOpenLogs(false)
          setIsOpenChat(true)
        } else if (currentBreakpoint === BREAKPOINTS.LG && isOpenLogs && !isOpenChat) {
          setIsOpenLogs(false)
          setIsOpenChat(true)
        } else if (currentBreakpoint === BREAKPOINTS.XL && !isOpenSettings && isOpenLogs ) {
          setIsOpenSettings(true)
          setIsOpenLogs(false)
        } else {
          setIsOpenLogs(!isOpenLogs)
        }
      }}
      title="Логи очереди"
    >
      <QueueLogsPanel />
    </CollapsiblePanel>
  )

  const queuePanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.queue}
      isOpen={isOpenQueue}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenLogs(false)
          setIsOpenQueue(!isOpenQueue)
          setIsOpenChat(false)
        } else if (currentBreakpoint === BREAKPOINTS.MD && isOpenQueue && !isOpenSettings ) {
          setIsOpenSettings(true)
          setIsOpenQueue(false)
        } else if (currentBreakpoint === BREAKPOINTS.LG && isOpenQueue && !isOpenSettings) {
          setIsOpenSettings(true)
          setIsOpenQueue(false)
        } else {
          setIsOpenQueue(!isOpenQueue)
        }
      }}
      title="Очередь"
    >
      <QueuePanel />
    </CollapsiblePanel>
  )

  const chatPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.chat}
      isOpen={isOpenChat}
      onToggle={() => {
        if(currentBreakpoint === BREAKPOINTS.SM) {
          setIsOpenSettings(false)
          setIsOpenQueue(false)
          setIsOpenLogs(false)
          setIsOpenChat(!isOpenChat)
        } else if (currentBreakpoint === BREAKPOINTS.MD && isOpenChat && !isOpenLogs) {
          setIsOpenLogs(true)
          setIsOpenChat(false)
        } else if (currentBreakpoint === BREAKPOINTS.LG && isOpenChat && !isOpenLogs) {
          setIsOpenLogs(true)
          setIsOpenChat(false)
        } else {
          setIsOpenChat(!isOpenChat)
        }
      }}
      title="Чат трансляции"
    >
      <TwitchChat />
    </CollapsiblePanel>
  )
  return { settingsPanel, logsPanel, queuePanel, chatPanel }
}
