import { type FC, type ReactNode, useState } from 'react'
import PanelToggle from './PanelToggle.tsx'
import { PANEL_DIRECTIONS, type PanelDirection } from '../../../constants/panel.constants.ts'

export interface CollapsiblePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  collapsedClassName?: string;
  direction?: PanelDirection;
}

/**
 * * @param className - Стили для раскрытого состояния
 *  * @param collapsedClassName - Стили для свернутого состояния
 */
const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
  isOpen,
  onToggle,
  title,
  children,
  className = '',
  collapsedClassName = '',
  direction = PANEL_DIRECTIONS.HORIZONTAL,
}: CollapsiblePanelProps) => {
  const [isAnimationDone, setIsAnimationDone] = useState<boolean>(isOpen)
  const isHorizontal = direction === PANEL_DIRECTIONS.HORIZONTAL

  /**
   * Обработчик клика по кнопке сворачивания.
   */
  const handleToggle = () => {
    if (isOpen) {
      setIsAnimationDone(false)
    }
    onToggle()
  }

  /**
   * Обработчик завершения CSS-перехода.
   */
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLElement>) => {
    const targetProperty = isHorizontal ? 'width' : 'height'
    if (e.propertyName === targetProperty && e.target === e.currentTarget) {
      setIsAnimationDone(isOpen)
    }
  }

  // Настройка динамических классов размеров и отображения
  const sizeClasses = isHorizontal
    ? (isOpen ? `w-80 h-full ${className}` : `w-12 h-full bg-base-300 ${collapsedClassName}`)
    : (isOpen ? `w-full h-80 ${className}` : `w-full h-12 bg-base-300 ${collapsedClassName}`)

  const headerClasses = isOpen
    ? 'justify-between'
    : isHorizontal
      ? 'flex-col pt-2 pb-4 h-auto'
      : 'flex-row items-center'

  return (
    <section
      className={`
        flex flex-col bg-base-200 relative border-r border-base-300 
        transition-all duration-300 ease-in-out
        shadow-[inset_0_4px_4px_-4px]
        not-last:shadow-[inset_-4px_0_4px_-4px,inset_0_4px_4px_-4px]
        ${sizeClasses}
      `}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`
          absolute top-0 left-0 right-0 h-14 flex items-center z-10 px-3
          ${headerClasses}
        `}
      >
        {/* Горизонтальный заголовок (в раскрытом состоянии или в свернутом вертикальном) */}
        {(isOpen || !isHorizontal) && (
          <h2 className="text-sm font-bold uppercase tracking-wider truncate pr-10 select-none text-base-content/80">
            {title}
          </h2>
        )}

        <PanelToggle
          className={isOpen ? 'absolute right-2 top-2' : ''}
          direction={direction}
          isOpen={isOpen}
          onOpen={handleToggle}
          title={title}
        />

        {/* Вертикальный текст только в свернутом горизонтальном состоянии */}
        {!isOpen && isHorizontal && (
          <span
            className="p-2 text-xs font-bold text-base-content/40 tracking-widest uppercase [writing-mode:vertical-lr] mt-4 select-none max-h-[calc(100vh-8rem)] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {title}
          </span>
        )}
      </div>

      {(isOpen || !isAnimationDone) && (
        <div
          className={`
            flex flex-col h-full w-full pt-14 overflow-hidden
            ${isOpen ? 'transition-opacity duration-300 ease-in-out' : 'hidden'}
            ${isOpen && isAnimationDone ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {children}
        </div>
      )}
    </section>
  )
}

export default CollapsiblePanel
