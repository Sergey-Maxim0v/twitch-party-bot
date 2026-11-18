import type { FC } from 'react'
import type { TwitchEmoteDictionary } from '../types.ts'
import { splitTextByEmoteDictionary } from '../utils/splitTextByEmoteDictionary.ts'
import { splitTextByEmotes } from '../utils/splitTextByEmotes.ts'
import { ChatMessageSegments } from './ChatMessageSegments.tsx'

interface ChatMessageTextProps {
  text: string;
  emoteTag?: string;
  emoteDictionary: TwitchEmoteDictionary;
  showEmotes: boolean;
}

/**
 * Выводит текст сообщения, заменяя эмоции Twitch картинками.
 * Для своих сообщений использует словарь эмоций: Twitch не присылает для них тег `emotes`.
 */
export const ChatMessageText: FC<ChatMessageTextProps> = ({
  text,
  emoteTag,
  emoteDictionary,
  showEmotes,
}) => {
  if (!showEmotes) return <>{text}</>

  if (emoteTag) {
    return <ChatMessageSegments segments={splitTextByEmotes(text, emoteTag)} />
  }

  if (emoteDictionary.size === 0) return <>{text}</>

  return <ChatMessageSegments segments={splitTextByEmoteDictionary(text, emoteDictionary)} />
}
