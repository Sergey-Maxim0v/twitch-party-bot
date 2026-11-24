import { type FC } from 'react'
import { useTwitchAuth } from '../hooks/useTwitchAuth'
import { AuthContext } from './AuthContextInstance'
import type { ChildrenProps } from '../../../types/common.types.ts'

/**
 * Провайдер авторизации Twitch, наполняющий `AuthContext` состоянием сессии.
 */
export const AuthProvider: FC<ChildrenProps> = ({ children }) => {
  const auth = useTwitchAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}
