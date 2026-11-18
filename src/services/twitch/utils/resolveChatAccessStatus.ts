import type { ChatAccessFacts } from '../types.ts'
import type { ChatAccessStatus } from '../../socket/types.ts'
import { TWITCH_CHAT_ACCESS_STATUSES } from '../../socket/types.ts'
import { checkIsRoomRestricted } from './checkIsRoomRestricted.ts'

/**
 * Определяет статус доступа к чату по известным фактам.
 *
 * @param facts - Факты о бане, таймауте и ограничениях комнаты.
 * @returns Статус доступа к чату.
 */
export const resolveChatAccessStatus = (facts: ChatAccessFacts): ChatAccessStatus => {
  if (facts.isBanned) return TWITCH_CHAT_ACCESS_STATUSES.BANNED

  const isRestricted = facts.isTimeoutActive
    || facts.isSendBlocked
    || checkIsRoomRestricted(facts.roomTags)

  return isRestricted ? TWITCH_CHAT_ACCESS_STATUSES.RESTRICTED : TWITCH_CHAT_ACCESS_STATUSES.CONNECTED
}
