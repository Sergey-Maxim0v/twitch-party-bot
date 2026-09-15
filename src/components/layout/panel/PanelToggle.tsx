import { type FC } from 'react'
import { LuArrowLeftFromLine, LuArrowUpFromLine } from 'react-icons/lu'
import { PANEL_DIRECTIONS, type PanelDirection } from './types'

interface PanelToggleProps {
  isOpen: boolean;
  onOpen: () => void;
  title: string;
  className?: string;
  direction?: PanelDirection;
}

const PanelToggle: FC<PanelToggleProps> = ({
  isOpen,
  onOpen,
  title,
  className = '',
  direction = PANEL_DIRECTIONS.HORIZONTAL,
}: PanelToggleProps) => {
  const isHorizontal = direction === PANEL_DIRECTIONS.HORIZONTAL
  const Icon = isHorizontal ? LuArrowLeftFromLine : LuArrowUpFromLine

  const iconClasses = isHorizontal
    ? `${isOpen ? '-scale-x-100' : ''}`
    : `${isOpen ? '' : 'rotate-180'}`

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

export default PanelToggle
