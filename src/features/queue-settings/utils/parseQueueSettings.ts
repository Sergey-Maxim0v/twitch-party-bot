import { DEFAULT_QUEUE_SETTINGS } from '../../../constants/queue.constants.ts'
import { mergeWithDefaults } from '../../../hooks/utils/storage.utils.ts'
import { sanitizeQueueSettings } from './sanitizeQueueSettings.ts'
import type { SanitizedValue } from '../../../hooks/types/storage.types.ts'
import type { QueueSettings } from '../types.ts'

/**
 * Проверяет сохранённые настройки очереди, отбрасывает повреждённую конфигурацию игры
 * и дублирующиеся имена команд.
 *
 * @param value - Значение из хранилища.
 * @returns Безопасные настройки и признак повреждённого значения.
 */
export const parseQueueSettings = (value: unknown): SanitizedValue<QueueSettings> => {
  const settings = mergeWithDefaults(DEFAULT_QUEUE_SETTINGS, value)
  const sanitizedSettings = sanitizeQueueSettings(settings)

  return { value: sanitizedSettings, isInvalid: sanitizedSettings !== settings }
}
