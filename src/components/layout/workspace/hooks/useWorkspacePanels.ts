import { useEffect } from 'react'
import { type Breakpoint, BREAKPOINTS } from '../../../../hooks/types/breakpoint.types.ts'

interface UseWorkspacePanelProps {
  /** Текущий брейкпоинт экрана. */
  currentBreakpoint: Breakpoint
  /** Состояния раскрытия панелей. */
  isOpenSettings: boolean
  isOpenQueue: boolean
  isOpenLogs: boolean
  isOpenChat: boolean
  /** Обработчики изменения состояния панелей. */
  setIsOpenSettings: (isOpen: boolean) => void
  setIsOpenQueue: (isOpen: boolean) => void
  setIsOpenLogs: (isOpen: boolean) => void
  setIsOpenChat: (isOpen: boolean) => void
}

/**
 * Пользовательский хук для автоматического управления состоянием панелей интерфейса (открытие)
 * в зависимости от текущего брейкпоинта (размера экрана).
 */
export const useWorkspacePanels = ({
  currentBreakpoint,
  isOpenSettings,
  isOpenQueue,
  isOpenLogs,
  isOpenChat,
  setIsOpenSettings,
  setIsOpenQueue,
  setIsOpenLogs,
  setIsOpenChat,
}: UseWorkspacePanelProps) => {
  useEffect(() => {
    switch (currentBreakpoint) {
      case BREAKPOINTS.SM:
        setIsOpenSettings(false)
        setIsOpenQueue(true)
        setIsOpenLogs(false)
        setIsOpenChat(false)
        break
      case BREAKPOINTS.MD:
      case BREAKPOINTS.LG:
        if (!isOpenSettings && !isOpenQueue) {
          setIsOpenQueue(true)
        }
        if (!isOpenLogs && !isOpenChat) {
          setIsOpenChat(true)
        }
        break
      case BREAKPOINTS.XL:
        if (!isOpenSettings && !isOpenLogs) {
          setIsOpenLogs(true)
        }
        break
      case BREAKPOINTS.XXL:
        if (!isOpenSettings && !isOpenQueue && !isOpenLogs && !isOpenChat) {
          setIsOpenQueue(true)
          setIsOpenChat(true)
        }
        break
      default:
        break
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- Нужно реагировать только на изменение брейкпоинта
  }, [currentBreakpoint])
}
