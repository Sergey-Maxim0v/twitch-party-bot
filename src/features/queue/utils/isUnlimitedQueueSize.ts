import type { QueueSettings } from '../../queue-settings/types.ts'

/** Проверяет, что лимит активной очереди не задан. */
export const isUnlimitedQueueSize = (maxQueueSize: QueueSettings['maxQueueSize']): boolean =>
  maxQueueSize <= 0
