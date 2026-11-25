import type { QueueJoinDisplaced } from '../../queue/types.ts'
import { getQueuePlayerName } from '../../queue/utils/queuePlayers.utils.ts'
import type { QueueNotificationContextType } from '../context/QueueNotificationInstance.ts'

interface NotifyDisplacedPlayersArgs extends Pick<QueueNotificationContextType, 'addDeletedUser' | 'addMovedToWaitingUser'> {
  displaced: QueueJoinDisplaced;
}

/** Уведомления о вытесненных игроках в буфере чата. */
export const notifyDisplacedPlayers = ({
  displaced,
  addDeletedUser,
  addMovedToWaitingUser,
}: NotifyDisplacedPlayersArgs): void => {
  displaced.displacedToWaiting.forEach(player => addMovedToWaitingUser(getQueuePlayerName(player)))

  const removedPlayers = [...displaced.displacedRemoved, ...displaced.displacedAlreadyWaiting]

  removedPlayers.forEach(player => addDeletedUser(getQueuePlayerName(player)))
}
