import { type FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'
import { MarkInput } from './MarkInput.tsx'
import { QUEUE_MARK_LABELS, QUEUE_MARK_SETTINGS_TITLE } from '../../../constants/queue.constants.ts'
import type { QueueMarkKey } from '../types.ts'

/** Маркеры статусов участников в автоматических сообщениях очереди. */
export const Marks: FC = () => {
  const { settings, updateSettings } = useQueueSettings()

  const handleMarkChange = (key: QueueMarkKey, value: string) => {
    updateSettings({
      marks: { ...settings.marks, [key]: value },
    })
  }

  return (
    <div className="w-full min-w-0 space-y-2">
      <h4 className="label-text py-1 px-0 w-full break-normal whitespace-normal text-sm font-medium text-base-content/80">
        {QUEUE_MARK_SETTINGS_TITLE}
      </h4>

      <div className="flex w-full min-w-0 flex-wrap gap-2">
        {(Object.keys(QUEUE_MARK_LABELS) as QueueMarkKey[]).map(key => (
          <MarkInput
            key={key}
            label={QUEUE_MARK_LABELS[key]}
            markKey={key}
            onChange={handleMarkChange}
            value={settings.marks[key]}
          />
        ))}
      </div>
    </div>
  )
}
