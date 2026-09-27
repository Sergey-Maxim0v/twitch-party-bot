import type { ReactNode } from 'react'
import { useTwitchChatManager } from '../hooks/useTwitchChatManager.ts'
import { TwitchChatContext } from './TwitchChatInstance.ts'

interface TwitchChatProviderProps {
  children: ReactNode
}

export const TwitchChatProvider = ({ children }: TwitchChatProviderProps) => {
  const chatValue = useTwitchChatManager()

  return (
    <TwitchChatContext.Provider value={chatValue}>
      {children}
    </TwitchChatContext.Provider>
  )
}
