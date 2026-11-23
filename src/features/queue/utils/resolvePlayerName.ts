import type { QueuePlayer } from '../types.ts'
import { QUEUE_PLAYER_ID_LABEL } from '../../../constants/queue.constants.ts'

interface ResolvePlayerNameArgs {
  /** Имя от вызывающей стороны. */
  displayedUsername?: string;
  /** Логин от вызывающей стороны. */
  username?: string;
  /** Найденная запись игрока. */
  player?: Pick<QueuePlayer, 'displayedUsername' | 'username'>;
  /** ID для резервного имени. */
  userId?: string;
}

/** Возвращает имя игрока для лога и уведомления по доступным данным. */
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
