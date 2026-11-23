import { createContext } from 'react'
import type { MessageEmitter } from '../utils/createMessageEmitter.ts'
import type { ParsedIrcMessage, SendChatMessageOptions } from '../types.ts'

/**
 * Интерфейс контекста управления чатом Twitch.
 */
interface TwitchChatContextType {
  messages: ParsedIrcMessage[]
  sendChatMessage: (message: string, options?: SendChatMessageOptions) => boolean
  subscribeToChatCommands: MessageEmitter['subscribe']
}

/**
 * Контекст для предоставления доступа к состоянию чата Twitch в иерархии компонентов.
 */
export const TwitchChatContext = createContext<TwitchChatContextType | null>(null)
