import { QUEUE_PLAYER_ID_LABEL } from '../../../constants/queue.constants.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { QueueActionLog, QueuePlayer, QueueState } from '../types.ts'

export interface RemovePlayerDecision {
  logMessage: string;
  isError: boolean;
  playerName: string;
}

export interface RemoveDecision extends RemovePlayerDecision {
  nextState: QueueState;
}

export interface RemovePlayerResult extends QueueActionLog {
  isRemoved: boolean;
  playerName: string;
}

interface ResolvePlayerNameArgs {
  displayedUsername?: string;
  username?: string;
  player?: Pick<QueuePlayer, 'displayedUsername' | 'username'>;
  userId?: string;
}

export const resolvePlayerName = ({
  displayedUsername,
  username,
  player,
  userId,
}: ResolvePlayerNameArgs): string =>
  displayedUsername
  || player?.displayedUsername
  || player?.username
  || username
  || (userId ? `${QUEUE_PLAYER_ID_LABEL} ${userId}` : '')

export const toRemovePlayerResult = ({
  logMessage,
  isError,
  playerName,
}: RemovePlayerDecision): RemovePlayerResult => ({
  message: logMessage,
  logStatus: isError ? APP_LOG_STATUSES.ERROR : APP_LOG_STATUSES.INFO,
  isRemoved: !isError,
  playerName,
})
