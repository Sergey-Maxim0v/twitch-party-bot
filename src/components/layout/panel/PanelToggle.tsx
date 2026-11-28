import { type FC } from 'react'
import { LuArrowRightFromLine, LuArrowUpFromLine } from 'react-icons/lu'
import { PANEL_DIRECTIONS, type PanelDirection } from './types'

interface PanelToggleProps {
  /** Развернута ли панель. */
  isOpen: boolean;
  /** Обработчик нажатия на кнопку сворачивания. */
  onOpen: () => void;
  /** Заголовок панели. */
  title: string;
  /** Дополнительные CSS-классы кнопки. */
  className?: string;
  /** Направление раскладки панели. */
  direction?: PanelDirection;
}

/**
 * Кнопка сворачивания панели с иконкой, зависящей от направления раскладки.
 */
export const PanelToggle: FC<PanelToggleProps> = ({
  isOpen,
  onOpen,
  title,
  className = '',
  direction = PANEL_DIRECTIONS.HORIZONTAL,
}) => {
  const isHorizontal = direction === PANEL_DIRECTIONS.HORIZONTAL
  const Icon = isHorizontal ? LuArrowRightFromLine : LuArrowUpFromLine
  const iconClasses = isHorizontal
    ? (isOpen ? 'rotate-y-180' : '')
    : (isOpen ? '' : 'rotate-180')

  return (
    <button
      className={`btn btn-sm btn-ghost btn-square transition-colors ${className}`}
      onClick={onOpen}
      title={isOpen ? `Скрыть ${title.toLowerCase()}` : `Открыть ${title.toLowerCase()}`}
      type="button"
    >
      <Icon
        className={`w-5 h-5 transition-transform duration-300 ${iconClasses}`}
      />
    </button>
  )
}
