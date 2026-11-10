import { useEffect } from 'react'
import { useSocketContext } from '../../socket/hooks/useSocketContext.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Базовый хук для подписки на события Twitch IRC.
 * Автоматически управляет жизненным циклом подписки.
 * @param callback - Обработчик входящих IRC-сообщений.
 */
export const useTwitchSubscription = (callback: (message: ParsedIrcMessage) => void) => {
  const socketContext = useSocketContext()

  useEffect(() => {
    if (!socketContext?.subscribe) return

    const unsubscribe = socketContext.subscribe(callback)

    return () => {
      unsubscribe()
    }
  }, [socketContext, callback])
}
