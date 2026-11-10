import { type Breakpoint, BREAKPOINTS } from '../../../../hooks/types/breakpoint.types.ts'
import { CollapsiblePanel } from '../../panel/CollapsiblePanel.tsx'
import { QueueSettingsPanel } from '../../../../features/queue-settings/components/QueueSettingsPanel.tsx'
import { QueueLogsPanel } from '../../../../features/app-logs/components/QueueLogsPanel.tsx'
import { QueuePanel } from '../../../../features/queue/components/QueuePanel.tsx'
import { TwitchChat } from '../../../../services/twitch/components/TwitchChat.tsx'
import type { WorkspaceDirections } from '../../panel/utils/getPanelDirections.ts'

interface CreateWorkspacePanelProps {
  /** Общие CSS-классы панелей. */
  panelStyle: string
  /** Направления раскладки панелей. */
  directions: WorkspaceDirections
  /** Текущий брейкпоинт экрана. */
  currentBreakpoint: Breakpoint
  /** Состояния раскрытия панелей. */
  isOpenSettings: boolean
  isOpenQueue: boolean
  isOpenLogs: boolean
  isOpenChat: boolean
  /** Обработчики изменения состояния панелей. */
  setIsOpenSettings: (isOpen: boolean) => void
  setIsOpenLogs: (isOpen: boolean) => void
  setIsOpenQueue: (isOpen: boolean) => void
  setIsOpenChat: (isOpen: boolean) => void
}

/**
 * Создаёт панели рабочего пространства с логикой переключения, зависящей от брейкпоинта экрана.
 */
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
  const toggleSettings = () => {
    switch (currentBreakpoint) {
      case BREAKPOINTS.SM:
        setIsOpenSettings(!isOpenSettings)
        setIsOpenLogs(false)
        setIsOpenQueue(false)
        setIsOpenChat(false)
        return
      case BREAKPOINTS.MD:
      case BREAKPOINTS.LG:
        if (isOpenSettings && !isOpenQueue) {
          setIsOpenSettings(false)
          setIsOpenQueue(true)
          return
        }
        setIsOpenSettings(!isOpenSettings)
        return
      case BREAKPOINTS.XL:
        if (isOpenSettings && !isOpenLogs) {
          setIsOpenSettings(false)
          setIsOpenLogs(true)
          return
        }
        setIsOpenSettings(!isOpenSettings)
        return
      default:
        setIsOpenSettings(!isOpenSettings)
    }
  }

  const toggleLogs = () => {
    switch (currentBreakpoint) {
      case BREAKPOINTS.SM:
        setIsOpenSettings(false)
        setIsOpenLogs(!isOpenLogs)
        setIsOpenQueue(false)
        setIsOpenChat(false)
        return
      case BREAKPOINTS.MD:
      case BREAKPOINTS.LG:
        if (isOpenLogs && !isOpenChat) {
          setIsOpenLogs(false)
          setIsOpenChat(true)
          return
        }
        setIsOpenLogs(!isOpenLogs)
        return
      case BREAKPOINTS.XL:
        if (!isOpenSettings && isOpenLogs) {
          setIsOpenSettings(true)
          setIsOpenLogs(false)
          return
        }
        setIsOpenLogs(!isOpenLogs)
        return
      default:
        setIsOpenLogs(!isOpenLogs)
    }
  }

  const toggleQueue = () => {
    switch (currentBreakpoint) {
      case BREAKPOINTS.SM:
        setIsOpenSettings(false)
        setIsOpenLogs(false)
        setIsOpenQueue(!isOpenQueue)
        setIsOpenChat(false)
        return
      case BREAKPOINTS.MD:
      case BREAKPOINTS.LG:
        if (isOpenQueue && !isOpenSettings) {
          setIsOpenSettings(true)
          setIsOpenQueue(false)
          return
        }
        setIsOpenQueue(!isOpenQueue)
        return
      default:
        setIsOpenQueue(!isOpenQueue)
    }
  }

  const toggleChat = () => {
    switch (currentBreakpoint) {
      case BREAKPOINTS.SM:
        setIsOpenSettings(false)
        setIsOpenQueue(false)
        setIsOpenLogs(false)
        setIsOpenChat(!isOpenChat)
        return
      case BREAKPOINTS.MD:
      case BREAKPOINTS.LG:
        if (isOpenChat && !isOpenLogs) {
          setIsOpenLogs(true)
          setIsOpenChat(false)
          return
        }
        setIsOpenChat(!isOpenChat)
        return
      default:
        setIsOpenChat(!isOpenChat)
    }
  }

  const settingsPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.settings}
      isOpen={isOpenSettings}
      onToggle={toggleSettings}
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
      onToggle={toggleLogs}
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
      onToggle={toggleQueue}
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
      onToggle={toggleChat}
      title="Чат трансляции"
    >
      <TwitchChat />
    </CollapsiblePanel>
  )

  return { settingsPanel, logsPanel, queuePanel, chatPanel }
}
