import { LuRotateCcw } from 'react-icons/lu'
import { ERROR_SCREEN_TEXTS } from '../../../constants/error.constants.ts'
import type { ErrorFallbackActionsProps } from '../types.ts'

/**
 * Кнопки экрана восстановления: повторная попытка и перезагрузка страницы.
 */
export const ErrorFallbackActions = ({ compact, onReload, onRetry }: ErrorFallbackActionsProps) => {
  const retryClassName = compact ? 'btn btn-xs btn-primary' : 'btn btn-primary btn-sm'
  const reloadClassName = compact ? 'btn btn-xs btn-ghost' : 'btn btn-ghost btn-sm'
  const iconClassName = compact ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className={compact ? 'flex gap-2' : 'flex flex-wrap gap-2'}>
      <button className={retryClassName} onClick={onRetry} type="button">
        <LuRotateCcw className={iconClassName} /> {ERROR_SCREEN_TEXTS.RETRY}
      </button>
      <button className={reloadClassName} onClick={onReload} type="button">
        {ERROR_SCREEN_TEXTS.RELOAD}
      </button>
    </div>
  )
}
