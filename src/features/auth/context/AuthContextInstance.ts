import { createContext } from 'react'
import type { TwitchAuthHookResult } from '../types'

/**
 * Контекст авторизации. `undefined` означает, что `useAuth` вызван вне `AuthProvider`.
 */
export const AuthContext = createContext<TwitchAuthHookResult | undefined>(undefined)
