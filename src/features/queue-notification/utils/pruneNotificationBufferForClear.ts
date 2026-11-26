import { QUEUE_TYPES } from '../../../constants/queue.constants.ts'
import type { MutableQueueType } from '../../queue/types.ts'
import type { TwitchNotificationState } from '../types.ts'
import { removeUsername } from './removeUsername.ts'
import { removeUsersFromNotificationBuffer } from './removeUsersFromNotificationBuffer.ts'

interface PruneNotificationBufferForClearArgs {
  /** Текущий буфер уведомлений. */
  state: TwitchNotificationState;
  /** Очищаемый список очереди. */
  queueType: MutableQueueType;
  /** Никнеймы игроков, находившихся в очищаемом списке. */
  usernames: string[];
  /** Никнеймы из оставшихся очередей, чьи удаления нужно сохранить. */
  preservedDeletedUsernames?: string[];
}

const filterDeletedMembers = (
  deleted: TwitchNotificationState['deleted'],
  preservedDeletedUsernames: string[],
): TwitchNotificationState['deleted'] => {
  if (preservedDeletedUsernames.length === 0) {
    return new Set<string>()
  }

  const preserved = new Set(preservedDeletedUsernames.map(username => username.toLowerCase()))
  let nextDeleted = deleted

  deleted.forEach(username => {
    if (preserved.has(username.toLowerCase())) return

    const filteredMembers = removeUsername(nextDeleted, username.toLowerCase())
    if (filteredMembers) nextDeleted = filteredMembers
  })

  return nextDeleted
}

/** Убирает из буфера неактуальные события перед очисткой очереди. */
export const pruneNotificationBufferForClear = ({
  state,
  queueType,
  usernames,
  preservedDeletedUsernames = [],
}: PruneNotificationBufferForClearArgs): TwitchNotificationState => {
  const nextState = removeUsersFromNotificationBuffer({ state, usernames })
  const deleted = filterDeletedMembers(nextState.deleted, preservedDeletedUsernames)

  if (queueType === QUEUE_TYPES.ACTIVE) {
    return {
      ...nextState,
      joined: new Set<string>(),
      movedToActive: new Set<string>(),
      deleted,
    }
  }

  return {
    ...nextState,
    waiting: new Set<string>(),
    movedToWaiting: new Set<string>(),
    deleted,
  }
}
