import { type FC } from 'react'
import { STATUS_BADGE_TYPES } from '../../../constants/ui.constants.ts'
import type { StatusBadgeType } from './types'

interface StatusIndicatorProps {
  /** Заголовок группы статуса (например, "Сеть" или "Чат"). */
  label: string;
  /** Короткое слово состояния (например, "Подключен", "Ожидание"). */
  statusText: string;
  /** Тип окраски индикатора в стиле DaisyUI. */
  badgeType: StatusBadgeType;
  /** Текст подробной подсказки при наведении. */
  tooltipText: string;
}

const BADGE_COLORS: Record<StatusBadgeType, string> = {
  [STATUS_BADGE_TYPES.SUCCESS]: 'bg-success',
  [STATUS_BADGE_TYPES.WARNING]: 'bg-warning',
  [STATUS_BADGE_TYPES.ERROR]: 'bg-error',
  [STATUS_BADGE_TYPES.INFO]: 'bg-info',
  [STATUS_BADGE_TYPES.NEUTRAL]: 'bg-neutral-content',
}

/**
 * Индикатор состояния с цветной точкой, подписью и подсказкой при наведении.
 */
export const StatusIndicator: FC<StatusIndicatorProps> = ({
  label,
  statusText,
  badgeType,
  tooltipText,
}) => {
  const isPulsing = badgeType !== STATUS_BADGE_TYPES.ERROR && badgeType !== STATUS_BADGE_TYPES.NEUTRAL

  return (
    <div
      className="lg:tooltip lg:tooltip-bottom lg:tooltip-neutral text-left z-100"
      data-tip={tooltipText}
    >
      <div className="flex items-center gap-1.5 px-3 h-8 bg-base-300 rounded-lg border border-base-100
            hover:bg-base-200 transition-colors select-none"
      >
        <span className="text-xs opacity-60 font-medium">
          {label}:
        </span>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            {isPulsing && (
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75
                            ${BADGE_COLORS[badgeType]}`}
              ></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${BADGE_COLORS[badgeType]}`}></span>
          </span>

          <span className="text-sm font-bold text-base-content">
            {statusText}
          </span>
        </div>
      </div>
    </div>
  )
}
