import { useEffect } from 'react'
import { type Breakpoint, BREAKPOINTS } from '../../../../hooks/types/breakpoint.types.ts'

export interface UseWorkspacePanelProps {
  currentBreakpoint: Breakpoint
  isOpenSettings: boolean
  isOpenQueue: boolean
  isOpenLogs: boolean
  isOpenChat: boolean
  setIsOpenSettings: (isOpen: boolean) => void
  setIsOpenQueue: (isOpen: boolean) => void
  setIsOpenLogs: (isOpen: boolean) => void
  setIsOpenChat: (isOpen: boolean) => void
}

export const useWorkspacePanels = ({
  currentBreakpoint,
  isOpenSettings,
  isOpenQueue,
  isOpenLogs,
  isOpenChat,
  setIsOpenSettings,
  setIsOpenQueue,
  setIsOpenLogs,
  setIsOpenChat }: UseWorkspacePanelProps) => {
  useEffect(() => {
    if(currentBreakpoint === BREAKPOINTS.SM) {
      setIsOpenSettings(false)
      setIsOpenQueue(true)
      setIsOpenLogs(false)
      setIsOpenChat(false)
    }

    if(currentBreakpoint === BREAKPOINTS.MD || currentBreakpoint === BREAKPOINTS.LG) {
      if(!isOpenSettings && !isOpenQueue) {
        setIsOpenQueue(true)
      }
      if(!isOpenLogs && !isOpenChat) {
        setIsOpenChat(true)
      }
    }

    if(currentBreakpoint === BREAKPOINTS.XL) {
      if(!isOpenSettings && !isOpenLogs) {
        setIsOpenLogs(true)
      }
    }

    if(currentBreakpoint === BREAKPOINTS.XXL) {
      if(!isOpenSettings && !isOpenQueue && !isOpenLogs && !isOpenChat) {
        setIsOpenQueue(true)
        setIsOpenChat(true)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Нужно реагировать только на изменение брейкпоинта
  }, [currentBreakpoint])
}
