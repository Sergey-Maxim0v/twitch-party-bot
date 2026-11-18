import { TWITCH_CHAT_TEXT_SPLIT_REGEX } from '../../../constants/twitch.constants.ts'
import type { ChatMessageSegment, TwitchEmoteDictionary } from '../types.ts'

/**
 * Делит текст сообщения на слова и эмоции Twitch по словарю кодов.
 *
 * @param text - Текст сообщения.
 * @param dictionary - Словарь «код эмоции → ID».
 * @returns Сегменты сообщения в исходном порядке.
 */
export const splitTextByEmoteDictionary = (
  text: string,
  dictionary: TwitchEmoteDictionary,
): ChatMessageSegment[] => {
  const segments: ChatMessageSegment[] = []

  for (const part of text.split(TWITCH_CHAT_TEXT_SPLIT_REGEX)) {
    if (!part) continue

    const id = dictionary.get(part)

    if (id) {
      segments.push({ type: 'emote', id, name: part })
      continue
    }

    const lastSegment = segments[segments.length - 1]

    if (lastSegment?.type === 'text') {
      lastSegment.text += part
      continue
    }

    segments.push({ type: 'text', text: part })
  }

  return segments.length > 0 ? segments : [{ type: 'text', text }]
}
