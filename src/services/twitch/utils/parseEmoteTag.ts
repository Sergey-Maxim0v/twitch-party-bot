import {
  TWITCH_EMOTE_NUMBER_PATTERN,
  TWITCH_EMOTE_TAG_DELIMITERS,
} from '../../../constants/twitch.constants.ts'
import type { EmoteRange } from '../types.ts'

/**
 * Разбирает IRC-тег `emotes` в диапазоны эмоций.
 *
 * @param emoteTag - Значение тега `emotes`.
 * @returns Диапазоны эмоций, отсортированные по началу.
 */
export const parseEmoteTag = (emoteTag: string): EmoteRange[] => {
  const ranges: EmoteRange[] = []

  for (const emoteEntry of emoteTag.split(TWITCH_EMOTE_TAG_DELIMITERS.EMOTES)) {
    const [id, positions = ''] = emoteEntry.split(TWITCH_EMOTE_TAG_DELIMITERS.ID)

    if (!TWITCH_EMOTE_NUMBER_PATTERN.test(id)) continue

    for (const position of positions.split(TWITCH_EMOTE_TAG_DELIMITERS.RANGES)) {
      const parts = position.split(TWITCH_EMOTE_TAG_DELIMITERS.RANGE)

      if (parts.length !== 2) continue

      const [rawStart, rawEnd] = parts
      if (!TWITCH_EMOTE_NUMBER_PATTERN.test(rawStart) || !TWITCH_EMOTE_NUMBER_PATTERN.test(rawEnd)) continue

      const start = Number(rawStart)
      const end = Number(rawEnd)

      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start) continue

      ranges.push({ id, start, end })
    }
  }

  return ranges.sort((left, right) => left.start - right.start)
}
