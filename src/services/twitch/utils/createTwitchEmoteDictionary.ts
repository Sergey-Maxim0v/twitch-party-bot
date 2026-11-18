import type { TwitchEmote, TwitchEmoteDictionary } from '../types.ts'

/**
 * Собирает словарь эмоций, отдавая приоритет эмоциям канала при совпадении кодов.
 *
 * @param globalEmotes - Глобальные эмоции Twitch.
 * @param channelEmotes - Эмоции текущего канала.
 * @returns Словарь «код эмоции → ID».
 */
export const createTwitchEmoteDictionary = (
  globalEmotes: TwitchEmote[],
  channelEmotes: TwitchEmote[],
): TwitchEmoteDictionary => {
  const dictionary = new Map<string, string>()

  for (const emote of globalEmotes) {
    dictionary.set(emote.name, emote.id)
  }

  for (const emote of channelEmotes) {
    dictionary.set(emote.name, emote.id)
  }

  return dictionary
}
