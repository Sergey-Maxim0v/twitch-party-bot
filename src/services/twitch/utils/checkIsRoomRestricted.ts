import { TWITCH_ROOM_STATE_TAGS } from '../../../constants/twitch.constants.ts'

/**
 * Проверяет теги состояния комнаты на наличие активных ограничений чата
 * (режим подписчиков, режим смайлов или медленный режим).
 *
 * @param tags - Теги состояния комнаты.
 * @returns `true`, если в чате действует хотя бы одно ограничение.
 */
export const checkIsRoomRestricted = (tags: Record<string, string>): boolean => {
  const isSubsOnly = tags[TWITCH_ROOM_STATE_TAGS.SUBS_ONLY] === '1'
  const isEmoteOnly = tags[TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY] === '1'
  const isSlowMode = Boolean(tags[TWITCH_ROOM_STATE_TAGS.SLOW]) && tags[TWITCH_ROOM_STATE_TAGS.SLOW] !== '0'

  return (isSubsOnly || isEmoteOnly || isSlowMode)
}
