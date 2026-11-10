import { useEffect, useState } from 'react'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { TWITCH_CHAT_ACCESS_STATUSES } from '../../../services/socket/types.ts'

/**
 * Проверяет готовность к отправке автоматических уведомлений.
 *
 * @returns `true`, если чат инициализирован и доступен для отправки сообщений.
 */
export const useNotificationGuard = (): boolean => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const socketContext = useSocketContext()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (!isInitialized) {
    return false
  }

  const chatStatus = socketContext?.chatAccessStatus ?? TWITCH_CHAT_ACCESS_STATUSES.OFFLINE

  return chatStatus === TWITCH_CHAT_ACCESS_STATUSES.CONNECTED || chatStatus === TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED
}
