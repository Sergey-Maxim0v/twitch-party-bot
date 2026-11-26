import type { TwitchNotificationState } from '../types.ts'
import { NOTIFICATION_FIELDS } from '../constants.ts'
import { removeUsername } from './removeUsername.ts'

interface RemoveUsersFromNotificationBufferArgs {
  /** Текущий буфер уведомлений. */
  state: TwitchNotificationState;
  /** Никнеймы, которых нужно убрать из буфера. */
  usernames: string[];
}

/** Убирает указанных пользователей из всех групп буфера уведомлений. */
export const removeUsersFromNotificationBuffer = ({
  state,
  usernames,
}: RemoveUsersFromNotificationBufferArgs): TwitchNotificationState => {
  let nextState = state

  usernames.forEach(username => {
    const normalizedUsername = username.toLowerCase()

    NOTIFICATION_FIELDS.forEach(field => {
      const filteredMembers = removeUsername(nextState[field], normalizedUsername)

      if (!filteredMembers) return

      nextState = { ...nextState, [field]: filteredMembers }
    })
  })

  return nextState
}
