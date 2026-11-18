import { TWITCH_CLIENT_ID } from '../../../constants/auth.constants.ts'
import {
  TWITCH_EMOTE_LOG_MESSAGES,
  TWITCH_EMOTE_LOG_PREFIX,
  TWITCH_HELIX_BASE_URL,
  TWITCH_HELIX_EMOTE_QUERY_PARAMS,
  TWITCH_HELIX_REQUEST_TIMEOUT_MS,
} from '../../../constants/twitch.constants.ts'
import type { TwitchEmote } from '../types.ts'

interface TwitchHelixEmotesResponse {
  data?: TwitchEmote[];
  pagination?: { cursor?: string };
}

/**
 * Загружает все страницы списка эмоций Twitch по указанному пути Helix API.
 *
 * @param path - Путь запроса, начиная с `/`.
 * @param token - Токен доступа пользователя.
 * @param queryParams - Параметры строки запроса.
 * @returns Уже загруженные эмоции либо пустой массив, если первая страница недоступна.
 */
export const fetchTwitchEmotes = async (
  path: string,
  token: string,
  queryParams: Record<string, string> = {},
): Promise<TwitchEmote[]> => {
  const emotes: TwitchEmote[] = []
  let cursor: string | undefined

  try {
    do {
      const url = new URL(`${TWITCH_HELIX_BASE_URL}${path}`)

      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value)
      }

      if (cursor) {
        url.searchParams.set(TWITCH_HELIX_EMOTE_QUERY_PARAMS.AFTER, cursor)
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
        signal: AbortSignal.timeout(TWITCH_HELIX_REQUEST_TIMEOUT_MS),
      })

      if (!response.ok) {
        console.error(`${TWITCH_EMOTE_LOG_PREFIX} ${TWITCH_EMOTE_LOG_MESSAGES.HTTP_ERROR(response.status)}`)
        return emotes
      }

      const page = await response.json() as TwitchHelixEmotesResponse
      const pageEmotes = Array.isArray(page.data) ? page.data : []

      emotes.push(...pageEmotes)
      cursor = page.pagination?.cursor
    } while (cursor)
  } catch (error) {
    console.error(`${TWITCH_EMOTE_LOG_PREFIX} ${TWITCH_EMOTE_LOG_MESSAGES.NETWORK_ERROR}`, error)
  }

  return emotes
}
