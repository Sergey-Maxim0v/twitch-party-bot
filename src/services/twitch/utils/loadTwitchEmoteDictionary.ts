import { TWITCH_CHANNEL_PROFILE_STATUSES } from '../../../constants/auth.constants.ts'
import {
  TWITCH_HELIX_EMOTE_PATHS,
  TWITCH_HELIX_EMOTE_QUERY_PARAMS,
  TWITCH_HELIX_EMOTES_PAGE_SIZE,
} from '../../../constants/twitch.constants.ts'
import { getTwitchChannelProfile } from '../../../features/auth/utils/getTwitchChannelProfile.ts'
import type { TwitchEmoteDictionary } from '../types.ts'
import { createTwitchEmoteDictionary } from './createTwitchEmoteDictionary.ts'
import { fetchTwitchEmotes } from './fetchTwitchEmotes.ts'

/**
 * Загружает глобальные эмоции и эмоции канала для отображения в чате.
 *
 * @param channel - Логин канала.
 * @param token - Токен доступа пользователя.
 * @returns Словарь эмоций; только глобальные, если профиль канала недоступен.
 */
export const loadTwitchEmoteDictionary = async (
  channel: string,
  token: string,
): Promise<TwitchEmoteDictionary> => {
  const [globalEmotes, channelProfile] = await Promise.all([
    fetchTwitchEmotes(TWITCH_HELIX_EMOTE_PATHS.GLOBAL, token),
    getTwitchChannelProfile(channel, token),
  ])

  if (channelProfile.status !== TWITCH_CHANNEL_PROFILE_STATUSES.FOUND) {
    return createTwitchEmoteDictionary(globalEmotes, [])
  }

  const channelEmotes = await fetchTwitchEmotes(
    TWITCH_HELIX_EMOTE_PATHS.CHANNEL,
    token,
    {
      [TWITCH_HELIX_EMOTE_QUERY_PARAMS.BROADCASTER_ID]: channelProfile.data.id,
      [TWITCH_HELIX_EMOTE_QUERY_PARAMS.FIRST]: TWITCH_HELIX_EMOTES_PAGE_SIZE,
    },
  )

  return createTwitchEmoteDictionary(globalEmotes, channelEmotes)
}
