import type { FC } from 'react'
import { ChatEmote } from './ChatEmote.tsx'
import { splitTextByEmotes } from '../utils/splitTextByEmotes.ts'

interface ChatMessageTextProps {
  text: string;
  emoteTag?: string;
  showEmotes: boolean;
}

/**
 * Выводит текст сообщения, заменяя эмоции Twitch картинками.
 */
export const ChatMessageText: FC<ChatMessageTextProps> = ({ text, emoteTag, showEmotes }) => {
  if (!showEmotes || !emoteTag) return <>{text}</>

  return (
    <>
      {splitTextByEmotes(text, emoteTag).map((segment, index) => (
        segment.type === 'emote'
          ? <ChatEmote id={segment.id} key={index} name={segment.name} />
          : <span key={index}>{segment.text}</span>
      ))}
    </>
  )
}
