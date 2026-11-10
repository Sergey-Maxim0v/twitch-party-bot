import { type FC } from 'react'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { PANEL_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { useBreakpoint } from '../../../hooks/useBreakpoint.ts'
import { getPanelDirections } from '../panel/utils/getPanelDirections.ts'
import { BREAKPOINTS } from '../../../hooks/types/breakpoint.types.ts'
import { useWorkspacePanels } from './hooks/useWorkspacePanels.ts'
import { createWorkspacePanels } from './utils/createWorkspacePanels.tsx'

/**
 * Рабочее пространство стримера с панелями настроек, очереди, логов и чата.
 */
export const StreamerWorkspace: FC = () => {
  const [isOpenSettings, setIsOpenSettings] = useLocalStorage<boolean>(PANEL_STORAGE_KEYS.SETTINGS_OPEN, true)
  const [isOpenQueue, setIsOpenQueue] = useLocalStorage<boolean>(PANEL_STORAGE_KEYS.QUEUE_OPEN, true)
  const [isOpenLogs, setIsOpenLogs] = useLocalStorage<boolean>(PANEL_STORAGE_KEYS.LOGS_OPEN, true)
  const [isOpenChat, setIsOpenChat] = useLocalStorage<boolean>(PANEL_STORAGE_KEYS.CHAT_OPEN, true)

  const currentBreakpoint = useBreakpoint()
  const directions = getPanelDirections(currentBreakpoint)

  useWorkspacePanels({
    currentBreakpoint,
    isOpenSettings,
    isOpenQueue,
    isOpenLogs,
    isOpenChat,
    setIsOpenSettings,
    setIsOpenQueue,
    setIsOpenLogs,
    setIsOpenChat,
  })

  const panelStyle = 'flex-1 min-w-0 min-h-0'

  const { settingsPanel, queuePanel, logsPanel, chatPanel } = createWorkspacePanels({
    currentBreakpoint,
    directions,
    isOpenSettings,
    isOpenQueue,
    isOpenLogs,
    isOpenChat,
    panelStyle,
    setIsOpenSettings,
    setIsOpenQueue,
    setIsOpenLogs,
    setIsOpenChat,
  })

  return (
    <div className="w-screen h-full flex justify-center bg-base-300 overflow-hidden">
      <div className="w-full h-full flex bg-base-100 overflow-hidden flex-col md:flex-row">
        {/* Мобильная раскладка: все панели в один столбец */}
        {currentBreakpoint === BREAKPOINTS.SM && (
          <>
            {settingsPanel}
            {queuePanel}
            {logsPanel}
            {chatPanel}
          </>
        )}

        {/* Планшетная раскладка: две колонки по две панели */}
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

        {/* Ноутбучная раскладка: настройки и логи в колонке, очередь и чат сбоку */}
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

        {/* Десктопная раскладка: все панели в ряд */}
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
  )
}
