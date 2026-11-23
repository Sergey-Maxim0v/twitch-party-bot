import type { QueueSettings } from '../../queue-settings/types.ts'
import { isUnlimitedQueueSize } from './isUnlimitedQueueSize.ts'

/** Аргументы форматирования счётчика списка очереди. */
interface FormatQueueBadgeArgs extends Pick<QueueSettings, 'maxQueueSize'> {
  /** Текущее количество игроков в списке. */
  queueLength: number;
}

/** Формирует текст бейджа списка очереди без знаменателя в режиме без лимита. */
export const formatQueueBadge = ({ maxQueueSize, queueLength }: FormatQueueBadgeArgs): string =>
  isUnlimitedQueueSize(maxQueueSize) ? String(queueLength) : `${queueLength} / ${maxQueueSize}`
