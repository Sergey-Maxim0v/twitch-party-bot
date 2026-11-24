import { useEffect, useRef } from 'react'
import { useSocketContext } from './useSocketContext.ts'
import { useAuth } from '../../../features/auth/hooks/useAuth.ts'

/**
 * Синхронизирует сессию и выбранный канал с WebSocket-соединением.
 */
export const useSocketInit = (): void => {
  const { isAuthenticated, session, activeChannel, expireSession } = useAuth()
  const { connect, disconnect, onAuthFailure } = useSocketContext()
  const wasConnectedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated && session?.accessToken && activeChannel && session?.login) {
      wasConnectedRef.current = true
      connect(activeChannel, session.accessToken, session.login)
      return
    }

    if (!wasConnectedRef.current) return

    wasConnectedRef.current = false
    disconnect()
  }, [isAuthenticated, session?.accessToken, session?.login, activeChannel, connect, disconnect])

  useEffect(() => () => disconnect(), [disconnect])

  useEffect(() => onAuthFailure(() => {
    expireSession()
  }), [onAuthFailure, expireSession])
}
