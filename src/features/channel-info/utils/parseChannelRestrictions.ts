import { TWITCH_ROOM_STATE_TAGS } from '../../../constants/twitch.constants.ts'
import { parseRoomStateRestrictions } from '../../../services/twitch/utils/roomState.ts'
import type { ChannelRestriction } from '../types'

/**
 * Порядок вывода ограничений доступа к чату в интерфейсе.
 */
const RESTRICTION_ORDER = [
  TWITCH_ROOM_STATE_TAGS.SUBS_ONLY,
  TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY,
  TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY,
  TWITCH_ROOM_STATE_TAGS.SLOW,
  TWITCH_ROOM_STATE_TAGS.R9K,
] as const

/**
 * Короткие названия ограничений доступа к чату.
 */
const RESTRICTION_TITLES: Record<string, string> = {
  [TWITCH_ROOM_STATE_TAGS.SUBS_ONLY]: 'Только подписчики',
  [TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY]: 'Только смайлы',
  [TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY]: 'Только фолловеры',
  [TWITCH_ROOM_STATE_TAGS.SLOW]: 'Медленный режим',
  [TWITCH_ROOM_STATE_TAGS.R9K]: 'Уникальные сообщения',
}

/**
 * Собирает список активных ограничений доступа к чату из накопленных тегов ROOMSTATE.
 *
 * @param roomTags - Накопленные теги состояния комнаты.
 * @returns Список активных ограничений в порядке вывода.
 */
export const parseChannelRestrictions = (roomTags: Record<string, string>): ChannelRestriction[] => {
  const restrictions = parseRoomStateRestrictions(roomTags)

  return RESTRICTION_ORDER.flatMap(tag => {
    const restriction = restrictions[tag]

    if (!restriction?.isActive) return []

    return [{
      tag,
      title: RESTRICTION_TITLES[tag] ?? tag,
      description: restriction.description,
    }]
  })
}
