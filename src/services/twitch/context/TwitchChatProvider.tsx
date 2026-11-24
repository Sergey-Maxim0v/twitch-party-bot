import { type FC } from 'react'
import { useTwitchChatManager } from '../hooks/useTwitchChatManager.ts'
import { TwitchChatContext } from './TwitchChatInstance.ts'
import type { ChildrenProps } from '../../../types/common.types.ts'

/**
 * Провайдер контекста чата Twitch.
 */
export const TwitchChatProvider: FC<ChildrenProps> = ({ children }) => {
  const chatValue = useTwitchChatManager()

  return (
    <TwitchChatContext.Provider value={chatValue}>
      {children}
    </TwitchChatContext.Provider>
  )
}
