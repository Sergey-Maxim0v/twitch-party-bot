import type { FC } from 'react'
import { useQueueSettings } from '../hooks/useQueueSettings.ts'

export interface QueueResetSectionProps {
  titleClassName?: string;
  className?: string;
}

const QueueResetSettings: FC<QueueResetSectionProps> = ({ titleClassName = '', className = '' }) => {
  const { resetSettings } = useQueueSettings()
  return (
    <div
      className={`p-3 rounded-xl bg-base-200/50 border border-base-300/60 space-y-4 w-full min-w-0 ${className}`}
    >
      <h3 className={titleClassName}>Восстановить настройки по умолчанию</h3>

      <button
        className="btn btn-block btn-error btn-outline btn-sm shadow-sm font-semibold truncate"
        onClick={() => { resetSettings() }}
        type="button"
      >
        Восстановить настройки
      </button>
    </div>
  )
}

export default QueueResetSettings
