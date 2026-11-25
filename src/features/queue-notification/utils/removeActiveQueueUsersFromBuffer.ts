import type { TwitchNotificationState } from '../types.ts'
import { ACTIVE_QUEUE_NOTIFICATION_FIELDS } from '../constants.ts'
import type { FormatQueueStatusMessageArgs } from './formatQueueStatusMessage.ts'
import { removeUsername } from './removeUsername.ts'

type RemoveActiveQueueUsersFromBufferArgs = Pick<FormatQueueStatusMessageArgs, 'activeUsernames'> & {
  /** Текущий буфер уведомлений. */
  state: TwitchNotificationState;
}

/**
 * Убирает из буфера игроков, уже показанных в сообщении о заполнении очереди.
 * Группы ожидания не трогает: игрок может быть в обоих списках.
 */
export const removeActiveQueueUsersFromBuffer = ({
  state,
  activeUsernames,
}: RemoveActiveQueueUsersFromBufferArgs): TwitchNotificationState => {
  let nextState = state

  activeUsernames.forEach(username => {
    const normalizedUsername = username.toLowerCase()

    ACTIVE_QUEUE_NOTIFICATION_FIELDS.forEach(field => {
      const filteredMembers = removeUsername(nextState[field], normalizedUsername)

      if (!filteredMembers) return

      nextState = { ...nextState, [field]: filteredMembers }
    })
  })

  return nextState
}
