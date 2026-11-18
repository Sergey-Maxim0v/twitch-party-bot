import type { FC } from 'react'
import type { ChatMessageSegment } from '../types.ts'
import { ChatEmote } from './ChatEmote.tsx'

interface ChatMessageSegmentsProps {
  segments: ChatMessageSegment[];
}

/**
 * Выводит сегменты сообщения: обычный текст и эмоции Twitch.
 */
export const ChatMessageSegments: FC<ChatMessageSegmentsProps> = ({ segments }) => (
  <>
    {segments.map((segment, index) => (
      segment.type === 'emote'
        ? <ChatEmote id={segment.id} key={`${segment.type}-${index}`} name={segment.name} />
        : <span key={`${segment.type}-${index}`}>{segment.text}</span>
    ))}
  </>
)
