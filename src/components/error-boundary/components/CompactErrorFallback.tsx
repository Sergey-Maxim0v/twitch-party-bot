import { LuTriangleAlert } from 'react-icons/lu'
import { ERROR_SCREEN_TEXTS } from '../../../constants/error.constants.ts'
import type { ErrorFallbackProps } from '../types.ts'
import { ErrorFallbackActions } from './ErrorFallbackActions.tsx'

/**
 * Компактный экран восстановления для сбойной панели.
 */
export const CompactErrorFallback = ({ label, onReload, onRetry, records }: ErrorFallbackProps) => {
  const currentRecord = records[0]

  return (
    <div className="flex flex-col gap-2 p-3 overflow-y-auto text-xs text-base-content/70">
      <div className="alert alert-error alert-sm py-2">
        <LuTriangleAlert className="w-4 h-4 shrink-0" />
        <span className="font-semibold truncate">{label ?? ERROR_SCREEN_TEXTS.TITLE}</span>
      </div>

      <p className="font-mono break-all">{currentRecord?.message ?? ERROR_SCREEN_TEXTS.DESCRIPTION}</p>

      <ErrorFallbackActions compact onReload={onReload} onRetry={onRetry} />
    </div>
  )
}
