import { createContext } from 'react'
import type { ParsedIrcMessage } from '../utils/parseIrcMessage.ts'

/**
 * Интерфейс контекста управления чатом Twitch.
 */
interface TwitchChatContextType {
  messages: ParsedIrcMessage[]
  sendChatMessage: (message: string) => void
}

/**
 * Контекст для предоставления доступа к состоянию чата Twitch в иерархии компонентов.
 */
export const TwitchChatContext = createContext<TwitchChatContextType | null>(null)
