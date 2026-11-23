import { QUEUE_SETTING_VALUE_LABELS } from '../../../constants/queue.constants.ts'
import { isUnlimitedQueueSize } from '../../queue/utils/isUnlimitedQueueSize.ts'
import type { QueueSettings } from '../types.ts'

/** Аргументы форматирования значения настройки для журнала. */
interface FormatSettingValueArgs {
  /** Ключ основной настройки, если значение требует специального форматирования. */
  settingKey?: keyof QueueSettings;
  /** Форматируемое значение. */
  value: unknown;
}

/** Форматирует значение настройки для записи в журнал. */
export const formatSettingValue = ({ settingKey, value }: FormatSettingValueArgs): string => {
  if (settingKey === 'maxQueueSize' && typeof value === 'number' && isUnlimitedQueueSize(value)) {
    return QUEUE_SETTING_VALUE_LABELS.UNLIMITED
  }

  if (typeof value === 'boolean') {
    return value ? QUEUE_SETTING_VALUE_LABELS.ENABLED : QUEUE_SETTING_VALUE_LABELS.DISABLED
  }

  return String(value ?? QUEUE_SETTING_VALUE_LABELS.UNSET)
}
