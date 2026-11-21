import { TWITCH_CHANNEL_PROFILE_STATUSES } from '../../../constants/auth.constants.ts'
import {
  TWITCH_HELIX_EMOTE_PATHS,
  TWITCH_HELIX_EMOTE_QUERY_PARAMS,
  TWITCH_HELIX_EMOTES_PAGE_SIZE,
} from '../../../constants/twitch.constants.ts'
import { getTwitchChannelProfile } from '../../../features/auth/utils/getTwitchChannelProfile.ts'
import type { TwitchEmoteDictionaryResult } from '../types.ts'
import { createTwitchEmoteDictionary } from './createTwitchEmoteDictionary.ts'
import { fetchTwitchEmotes } from './fetchTwitchEmotes.ts'

/**
 * Загружает глобальные эмоции и эмоции канала для отображения в чате.
 *
 * @param channel - Логин канала.
 * @param token - Токен доступа пользователя.
 * @returns Словарь эмоций и признак отклонённого токена.
 */
export const loadTwitchEmoteDictionary = async (
  channel: string,
  token: string,
): Promise<TwitchEmoteDictionaryResult> => {
  const [globalEmotesResult, channelProfile] = await Promise.all([
    fetchTwitchEmotes(TWITCH_HELIX_EMOTE_PATHS.GLOBAL, token),
    getTwitchChannelProfile(channel, token),
  ])

  const globalDictionary = createTwitchEmoteDictionary(globalEmotesResult.emotes, [])

  if (globalEmotesResult.isUnauthorized) {
    return { dictionary: globalDictionary, isUnauthorized: true }
  }

  if (channelProfile.status === TWITCH_CHANNEL_PROFILE_STATUSES.UNAUTHORIZED) {
    return { dictionary: globalDictionary, isUnauthorized: true }
  }

  if (channelProfile.status !== TWITCH_CHANNEL_PROFILE_STATUSES.FOUND) {
    return { dictionary: globalDictionary, isUnauthorized: false }
  }

  const channelEmotesResult = await fetchTwitchEmotes(
    TWITCH_HELIX_EMOTE_PATHS.CHANNEL,
    token,
    {
      [TWITCH_HELIX_EMOTE_QUERY_PARAMS.BROADCASTER_ID]: channelProfile.data.id,
      [TWITCH_HELIX_EMOTE_QUERY_PARAMS.FIRST]: TWITCH_HELIX_EMOTES_PAGE_SIZE,
    },
  )

  return {
    dictionary: createTwitchEmoteDictionary(globalEmotesResult.emotes, channelEmotesResult.emotes),
    isUnauthorized: channelEmotesResult.isUnauthorized,
  }
}
