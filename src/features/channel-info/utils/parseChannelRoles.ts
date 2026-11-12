import type { ChannelRoles } from '../types'

/**
 * Префиксы бейджей Twitch, определяющие роли аккаунта в канале.
 */
const ROLE_BADGE_PREFIXES = {
  BROADCASTER: 'broadcaster/',
  MODERATOR: 'moderator/',
  VIP: 'vip/',
  SUBSCRIBER: 'subscriber/',
  FOUNDER: 'founder/',
} as const

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
  const badges = (tags.badges || '').split(',')

  const hasBadge = (prefix: string): boolean => badges.some(badge => badge.startsWith(prefix))

  return {
    isBroadcaster: hasBadge(ROLE_BADGE_PREFIXES.BROADCASTER),
    isModerator: tags.mod === '1' || hasBadge(ROLE_BADGE_PREFIXES.MODERATOR),
    isVip: tags.vip === '1' || hasBadge(ROLE_BADGE_PREFIXES.VIP),
    isSubscriber: tags.subscriber === '1'
      || hasBadge(ROLE_BADGE_PREFIXES.SUBSCRIBER)
      || hasBadge(ROLE_BADGE_PREFIXES.FOUNDER),
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
