import { TWITCH_IRC_BADGE_PREFIXES, TWITCH_IRC_TAG_ENABLED, TWITCH_IRC_TAGS } from '../../../constants/twitch.constants.ts'
import type { ChannelRoles } from '../types'

/**
 * Пустой набор ролей аккаунта в канале.
 */
export const EMPTY_CHANNEL_ROLES: ChannelRoles = {
  isBroadcaster: false,
  isModerator: false,
  isVip: false,
  isSubscriber: false,
}

/**
 * Определяет роли аккаунта по тегам входящего IRC-сообщения.
 *
 * @param tags - Теги входящего сообщения.
 * @returns Набор активных ролей аккаунта в канале.
 */
export const parseChannelRoles = (tags: Record<string, string>): ChannelRoles => {
  const badges = (tags[TWITCH_IRC_TAGS.BADGES] || '').split(',')

  const hasBadge = (prefix: string): boolean => badges.some(badge => badge.startsWith(prefix))

  return {
    isBroadcaster: hasBadge(TWITCH_IRC_BADGE_PREFIXES.BROADCASTER),
    isModerator: tags[TWITCH_IRC_TAGS.MOD] === TWITCH_IRC_TAG_ENABLED || hasBadge(TWITCH_IRC_BADGE_PREFIXES.MODERATOR),
    isVip: tags[TWITCH_IRC_TAGS.VIP] === TWITCH_IRC_TAG_ENABLED || hasBadge(TWITCH_IRC_BADGE_PREFIXES.VIP),
    isSubscriber: tags[TWITCH_IRC_TAGS.SUBSCRIBER] === TWITCH_IRC_TAG_ENABLED
      || hasBadge(TWITCH_IRC_BADGE_PREFIXES.SUBSCRIBER)
      || hasBadge(TWITCH_IRC_BADGE_PREFIXES.FOUNDER),
  }
}

/**
 * Сравнивает два набора ролей аккаунта.
 *
 * @param first - Первый набор ролей.
 * @param second - Второй набор ролей.
 * @returns `true`, если наборы ролей совпадают.
 */
export const areChannelRolesEqual = (first: ChannelRoles, second: ChannelRoles): boolean => (
  first.isBroadcaster === second.isBroadcaster
  && first.isModerator === second.isModerator
  && first.isVip === second.isVip
  && first.isSubscriber === second.isSubscriber
)
