import { useContext } from 'react'
import { TwitchChatContext } from '../context/TwitchChatInstance.ts'

/**
 * Хук для доступа к состоянию чата Twitch из контекста.
 */
export const useTwitchChat = () => {
  const context = useContext(TwitchChatContext)

  if (!context) {
    throw new Error('useTwitchChat must be used within a TwitchChatProvider')
  }

  return context
}
