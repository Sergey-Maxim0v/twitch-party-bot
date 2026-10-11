import type { TwitchNotificationState } from '../types.ts'

/** Создание чистого объекта буфера уведомлений */
export const createInitialNotificationState = (): TwitchNotificationState => ({
  joined: new Set<string>(),
  waiting: new Set<string>(),
  deleted: new Set<string>(),
  moved: new Set<string>(),
  denied: new Set<string>(),
})
