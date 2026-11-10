import type { TwitchNotificationState } from '../types.ts'

/** Создает пустой буфер уведомлений. */
export const createInitialNotificationState = (): TwitchNotificationState => ({
  joined: new Set<string>(),
  waiting: new Set<string>(),
  deleted: new Set<string>(),
  movedToActive: new Set<string>(),
  movedToWaiting: new Set<string>(),
  denied: new Set<string>(),
})
