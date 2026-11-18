import type { ChatMessageSegment } from '../types.ts'
import { parseEmoteTag } from './parseEmoteTag.ts'

/**
 * Делит текст сообщения на обычный текст и эмоции Twitch.
 *
 * @param text - Текст сообщения.
 * @param emoteTag - Значение тега `emotes`.
 * @returns Сегменты сообщения в исходном порядке.
 */
export const splitTextByEmotes = (text: string, emoteTag: string): ChatMessageSegment[] => {
  const ranges = parseEmoteTag(emoteTag)
  const segments: ChatMessageSegment[] = []
  let cursor = 0

  for (const { id, start, end } of ranges) {
    const emoteEnd = end + 1

    if (start < cursor) continue
    if (emoteEnd > text.length) break
    if (start > cursor) segments.push({ type: 'text', text: text.slice(cursor, start) })

    segments.push({ type: 'emote', id, name: text.slice(start, emoteEnd) })
    cursor = emoteEnd
  }

  if (!segments.length) return [{ type: 'text', text }]

  if (cursor < text.length) segments.push({ type: 'text', text: text.slice(cursor) })

  return segments
}
