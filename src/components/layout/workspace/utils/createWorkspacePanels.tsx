import { CollapsiblePanel } from '../../panel/CollapsiblePanel.tsx'
import { ErrorBoundary } from '../../../error-boundary/components/ErrorBoundary.tsx'
import { QueueSettingsPanel } from '../../../../features/queue-settings/components/QueueSettingsPanel.tsx'
import { QueueLogsPanel } from '../../../../features/app-logs/components/QueueLogsPanel.tsx'
import { QueuePanel } from '../../../../features/queue/components/QueuePanel.tsx'
import { TwitchChat } from '../../../../services/twitch/components/TwitchChat.tsx'
import { WORKSPACE_PANEL_TITLES } from '../../../../constants/layout.constants.ts'
import type { WorkspaceDirections } from '../../panel/utils/getPanelDirections.ts'
import type { UseWorkspacePanelProps } from '../hooks/useWorkspacePanels.ts'
import { type PanelKey, resolvePanelToggle } from './resolvePanelToggle.ts'

interface CreateWorkspacePanelProps extends UseWorkspacePanelProps {
  /** Общие CSS-классы панелей. */
  panelStyle: string;
  /** Направления раскладки панелей. */
  directions: WorkspaceDirections;
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
  const isOpen: Record<PanelKey, boolean> = {
    settings: isOpenSettings,
    queue: isOpenQueue,
    logs: isOpenLogs,
    chat: isOpenChat,
  }

  const setOpen: Record<PanelKey, (isOpen: boolean) => void> = {
    settings: setIsOpenSettings,
    queue: setIsOpenQueue,
    logs: setIsOpenLogs,
    chat: setIsOpenChat,
  }

  const toggle = (target: PanelKey) => resolvePanelToggle({ currentBreakpoint, target, isOpen, setOpen })

  const toggleSettings = () => toggle('settings')
  const toggleLogs = () => toggle('logs')
  const toggleQueue = () => toggle('queue')
  const toggleChat = () => toggle('chat')

  const settingsPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.settings}
      isOpen={isOpenSettings}
      onToggle={toggleSettings}
      title={WORKSPACE_PANEL_TITLES.SETTINGS}
    >
      <ErrorBoundary compact label={WORKSPACE_PANEL_TITLES.SETTINGS}>
        <QueueSettingsPanel />
      </ErrorBoundary>
    </CollapsiblePanel>
  )

  const logsPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.logs}
      isOpen={isOpenLogs}
      onToggle={toggleLogs}
      title={WORKSPACE_PANEL_TITLES.LOGS}
    >
      <ErrorBoundary compact label={WORKSPACE_PANEL_TITLES.LOGS}>
        <QueueLogsPanel />
      </ErrorBoundary>
    </CollapsiblePanel>
  )

  const queuePanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.queue}
      isOpen={isOpenQueue}
      onToggle={toggleQueue}
      title={WORKSPACE_PANEL_TITLES.QUEUE}
    >
      <ErrorBoundary compact label={WORKSPACE_PANEL_TITLES.QUEUE}>
        <QueuePanel />
      </ErrorBoundary>
    </CollapsiblePanel>
  )

  const chatPanel = (
    <CollapsiblePanel
      className={panelStyle}
      direction={directions.chat}
      isOpen={isOpenChat}
      onToggle={toggleChat}
      title={WORKSPACE_PANEL_TITLES.CHAT}
    >
      <ErrorBoundary compact label={WORKSPACE_PANEL_TITLES.CHAT}>
        <TwitchChat />
      </ErrorBoundary>
    </CollapsiblePanel>
  )

  return { settingsPanel, logsPanel, queuePanel, chatPanel }
}
