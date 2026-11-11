import { TWITCH_ROOM_STATE_TAGS } from '../../../constants/twitch.constants.ts'
import type { ParsedIrcMessage } from '../types.ts'

/**
 * Проверяет теги сообщения ROOMSTATE на наличие активных ограничений чата
 * (режим подписчиков, режим смайлов или медленный режим).
 * @param message - Сообщение с тегами состояния комнаты.
 * @returns `true`, если в чате действует хотя бы одно ограничение.
 */
export const checkIsRoomRestricted = (message: ParsedIrcMessage): boolean => {
  const tags = message.tags || {}
  const isSubsOnly = tags[TWITCH_ROOM_STATE_TAGS.SUBS_ONLY] === '1'
  const isEmoteOnly = tags[TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY] === '1'
  const isSlowMode = !!tags[TWITCH_ROOM_STATE_TAGS.SLOW] && tags[TWITCH_ROOM_STATE_TAGS.SLOW] !== '0'

  return (isSubsOnly || isEmoteOnly || isSlowMode)
}
