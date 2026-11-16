import { LuTriangleAlert } from 'react-icons/lu'
import { ERROR_SCREEN_TEXTS } from '../../../constants/error.constants.ts'
import { formatTimeWithSeconds } from '../../../utils/dateTime.ts'
import type { ErrorFallbackProps } from '../types.ts'
import { ErrorFallbackActions } from './ErrorFallbackActions.tsx'

/**
 * Полноэкранный экран восстановления после ошибки.
 */
export const ErrorFallback = ({ onReload, onRetry, records }: ErrorFallbackProps) => (
  <div className="h-screen w-screen flex items-center justify-center bg-base-100 p-4 text-base-content">
    <div className="w-full max-w-lg flex flex-col gap-4">
      <div className="alert alert-error">
        <LuTriangleAlert className="w-6 h-6 shrink-0" />
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-base">{ERROR_SCREEN_TEXTS.TITLE}</h1>
          <p className="text-sm text-base-content/70">{ERROR_SCREEN_TEXTS.DESCRIPTION}</p>
        </div>
      </div>

      <ErrorFallbackActions onReload={onReload} onRetry={onRetry} />

      <details className="collapse collapse-arrow bg-base-200/60 border border-base-300">
        <summary className="collapse-title text-xs font-semibold uppercase tracking-wider">
          {ERROR_SCREEN_TEXTS.DETAILS}
        </summary>

        <div className="collapse-content">
          <ul className="flex flex-col gap-3">
            {records.map(record => (
              <li className="text-xs" key={`${record.timestamp}-${record.message}`}>
                <div className="font-mono text-base-content/60">
                  {formatTimeWithSeconds(record.timestamp)} · {record.source}
                </div>
                <pre className="whitespace-pre-wrap break-all font-mono text-base-content/80">
                  {record.stack ?? record.message}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  </div>
)
