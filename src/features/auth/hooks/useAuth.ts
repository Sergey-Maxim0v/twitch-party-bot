import { useContext } from 'react'
import type { TwitchAuthHookResult } from '../types'
import { AuthContext } from '../context/AuthContextInstance.ts'

/**
 * Возвращает состояние авторизации из ближайшего `AuthProvider`.
 *
 * @returns Объект с сессией, статусами и действиями авторизации.
 * @throws {Error} Если хук вызван вне `AuthProvider`.
 */
export const useAuth = (): TwitchAuthHookResult => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
