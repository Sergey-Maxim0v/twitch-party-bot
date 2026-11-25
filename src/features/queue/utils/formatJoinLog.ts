import { QUEUE_JOIN_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import type { QueueJoinDisplaced } from '../types.ts'
import { formatDisplacedLog } from './formatDisplacedLog.ts'

interface FormatJoinLogArgs extends QueueJoinDisplaced {
  /** Имя добавленного игрока. */
  name: string;
}

/** Запись журнала о добавлении игрока с вытеснением. */
export const formatJoinLog = ({ name, ...displaced }: FormatJoinLogArgs): string =>
  [QUEUE_JOIN_LOG_MESSAGES.ACTIVE(name), ...formatDisplacedLog(displaced)].join(' ')
