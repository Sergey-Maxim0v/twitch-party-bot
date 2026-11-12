import { TWITCH_ROOM_STATE_MESSAGES, TWITCH_ROOM_STATE_TAGS } from '../../../constants/twitch.constants.ts'

/** Ограничение доступа к чату, разобранное из тегов ROOMSTATE. */
export interface RoomStateRestriction {
  /** Признак активности ограничения. */
  isActive: boolean;
  /** Человекочитаемое описание ограничения для сводки активных режимов. */
  description: string;
  /** Системное сообщение о включении или отключении режима. */
  message: string;
}

/**
 * Ограничения доступа к чату, разобранные из тегов ROOMSTATE.
 * Ключ — тег, по которому пришло ограничение.
 */
export type RoomStateRestrictions = Partial<Record<string, RoomStateRestriction>>

/**
 * Порядок ограничений для выбора единственного сообщения в чат.
 */
export const ROOM_STATE_MESSAGE_PRIORITY = [
  TWITCH_ROOM_STATE_TAGS.SUBS_ONLY,
  TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY,
  TWITCH_ROOM_STATE_TAGS.R9K,
  TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY,
  TWITCH_ROOM_STATE_TAGS.SLOW,
] as const

/**
 * Порядок ограничений для сводки активных режимов комнаты в журнале.
 */
export const ROOM_STATE_SUMMARY_PRIORITY = [
  TWITCH_ROOM_STATE_TAGS.SUBS_ONLY,
  TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY,
  TWITCH_ROOM_STATE_TAGS.SLOW,
  TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY,
] as const

/**
 * Порядок ограничений для логирования изменений режимов комнаты.
 */
export const ROOM_STATE_LOG_PRIORITY = [
  TWITCH_ROOM_STATE_TAGS.SUBS_ONLY,
  TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY,
  TWITCH_ROOM_STATE_TAGS.SLOW,
] as const

/**
 * Определяет, содержит ли пакет ROOMSTATE полный набор тегов,
 * то есть является ли стартовым пакетом инициализации комнаты.
 *
 * @param tags - Теги входящего сообщения.
 * @returns `true`, если это стартовый пакет инициализации комнаты.
 */
export const isRoomStateInitialization = (tags: Record<string, string>): boolean => (
  tags[TWITCH_ROOM_STATE_TAGS.SUBS_ONLY] !== undefined
  && tags[TWITCH_ROOM_STATE_TAGS.SLOW] !== undefined
  && tags[TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY] !== undefined
)

/**
 * Разбирает теги ROOMSTATE в набор ограничений доступа к чату.
 *
 * @param tags - Теги входящего сообщения.
 * @returns Ограничения, присутствующие в пакете, с их состоянием и сообщениями.
 */
export const parseRoomStateRestrictions = (tags: Record<string, string>): RoomStateRestrictions => {
  const restrictions: RoomStateRestrictions = {}

  const subsOnly = tags[TWITCH_ROOM_STATE_TAGS.SUBS_ONLY]

  if (subsOnly === '0' || subsOnly === '1') {
    const isActive = subsOnly === '1'

    restrictions[TWITCH_ROOM_STATE_TAGS.SUBS_ONLY] = {
      isActive,
      description: 'только для подписчиков',
      message: isActive
        ? TWITCH_ROOM_STATE_MESSAGES.SUBS_ONLY_ENABLED
        : TWITCH_ROOM_STATE_MESSAGES.SUBS_ONLY_DISABLED,
    }
  }

  const emoteOnly = tags[TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY]

  if (emoteOnly === '0' || emoteOnly === '1') {
    const isActive = emoteOnly === '1'

    restrictions[TWITCH_ROOM_STATE_TAGS.EMOTE_ONLY] = {
      isActive,
      description: 'только смайлы',
      message: isActive
        ? TWITCH_ROOM_STATE_MESSAGES.EMOTE_ONLY_ENABLED
        : TWITCH_ROOM_STATE_MESSAGES.EMOTE_ONLY_DISABLED,
    }
  }

  const slow = tags[TWITCH_ROOM_STATE_TAGS.SLOW]

  if (slow !== undefined && slow !== '') {
    const isActive = slow !== '0'

    restrictions[TWITCH_ROOM_STATE_TAGS.SLOW] = {
      isActive,
      description: isActive ? `медленный режим (${slow} сек.)` : 'медленный режим',
      message: isActive
        ? TWITCH_ROOM_STATE_MESSAGES.SLOW_ENABLED(slow)
        : TWITCH_ROOM_STATE_MESSAGES.SLOW_DISABLED,
    }
  }

  const followersOnly = tags[TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY]

  if (followersOnly !== undefined && followersOnly !== '') {
    const isActive = followersOnly !== '-1'

    restrictions[TWITCH_ROOM_STATE_TAGS.FOLLOWERS_ONLY] = {
      isActive,
      description: 'только для фолловеров',
      message: isActive
        ? TWITCH_ROOM_STATE_MESSAGES.FOLLOWERS_ONLY_ENABLED(parseInt(followersOnly, 10))
        : TWITCH_ROOM_STATE_MESSAGES.FOLLOWERS_ONLY_DISABLED,
    }
  }

  const r9k = tags[TWITCH_ROOM_STATE_TAGS.R9K]

  if (r9k === '0' || r9k === '1') {
    const isActive = r9k === '1'

    restrictions[TWITCH_ROOM_STATE_TAGS.R9K] = {
      isActive,
      description: 'уникальные сообщения',
      message: isActive
        ? TWITCH_ROOM_STATE_MESSAGES.R9K_ENABLED
        : TWITCH_ROOM_STATE_MESSAGES.R9K_DISABLED,
    }
  }

  return restrictions
}
