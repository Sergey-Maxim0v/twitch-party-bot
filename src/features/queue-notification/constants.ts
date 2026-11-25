import type { TwitchNotificationState } from './types.ts'

const NOTIFICATION_FIELD = {
  JOINED: 'joined',
  WAITING: 'waiting',
  DELETED: 'deleted',
  MOVED_TO_ACTIVE: 'movedToActive',
  MOVED_TO_WAITING: 'movedToWaiting',
  DENIED: 'denied',
} as const satisfies Record<string, keyof TwitchNotificationState>

/** Все группы событий буфера. */
export const NOTIFICATION_FIELDS = Object.values(NOTIFICATION_FIELD) satisfies readonly (keyof TwitchNotificationState)[]

/** Группы появления игрока в активной очереди. */
export const ACTIVE_QUEUE_NOTIFICATION_FIELDS = [
  NOTIFICATION_FIELD.JOINED,
  NOTIFICATION_FIELD.MOVED_TO_ACTIVE,
] as const satisfies readonly (keyof TwitchNotificationState)[]
