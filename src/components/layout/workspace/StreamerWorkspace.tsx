import { type FC } from 'react'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { useBreakpoint } from '../../../hooks/useBreakpoint.ts'
import { getPanelDirections } from '../panel/utils/getPanelDirections.ts'
import { BREAKPOINTS } from '../../../hooks/types/breakpoint.types.ts'
import { useWorkspacePanels } from './hooks/useWorkspacePanels.ts'
import { createWorkspacePanels } from './utils/createWorkspacePanels.tsx'

const StreamerWorkspace: FC = () => {
  const [isOpenSettings, setIsOpenSettings] = useLocalStorage<boolean>('panel_settings_open', true)
  const [isOpenQueue, setIsOpenQueue] = useLocalStorage<boolean>('panel_queue_open', true)
  const [isOpenLogs, setIsOpenLogs] = useLocalStorage<boolean>('panel_logs_open', true)
  const [isOpenChat, setIsOpenChat] = useLocalStorage<boolean>('panel_chat_open', true)

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
    directions,
    isOpenChat,
    setIsOpenSettings,
    setIsOpenQueue,
    isOpenLogs,
    isOpenQueue,
    isOpenSettings,
    setIsOpenChat,
    setIsOpenLogs,
    panelStyle,
    currentBreakpoint,
  })

  return (
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
  )
}

export default StreamerWorkspace
