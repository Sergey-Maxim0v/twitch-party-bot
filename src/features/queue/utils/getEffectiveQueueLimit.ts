import type { QueueSettings } from '../../queue-settings/types.ts'
import { isUnlimitedQueueSize } from './isUnlimitedQueueSize.ts'

/** Возвращает `Infinity`, если лимит активной очереди не задан. */
export const getEffectiveQueueLimit = (maxQueueSize: QueueSettings['maxQueueSize']): number =>
  isUnlimitedQueueSize(maxQueueSize) ? Number.POSITIVE_INFINITY : maxQueueSize
