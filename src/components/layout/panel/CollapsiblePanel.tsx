import { type FC, type ReactNode, type TransitionEvent, useState } from 'react'
import { PanelToggle } from './PanelToggle.tsx'
import { PANEL_DIRECTIONS, type PanelDirection } from './types'

interface CollapsiblePanelProps {
  /** Развернута ли панель. */
  isOpen: boolean;
  /** Обработчик переключения состояния панели. */
  onToggle: () => void;
  /** Заголовок панели. */
  title: string;
  /** Содержимое панели. */
  children: ReactNode;
  /** Дополнительные CSS-классы для раскрытого состояния. */
  className?: string;
  /** Дополнительные CSS-классы для свернутого состояния. */
  collapsedClassName?: string;
  /** Направление раскладки панели. */
  direction?: PanelDirection;
}

/**
 * Панель, которую можно свернуть и развернуть кнопкой в углу заголовка.
 */
export const CollapsiblePanel: FC<CollapsiblePanelProps> = ({
  isOpen,
  onToggle,
  title,
  children,
  className = '',
  collapsedClassName = '',
  direction = PANEL_DIRECTIONS.HORIZONTAL,
}) => {
  const [isAnimationDone, setIsAnimationDone] = useState<boolean>(isOpen)
  const isHorizontal = direction === PANEL_DIRECTIONS.HORIZONTAL

  const handleToggle = () => {
    if (isOpen) {
      setIsAnimationDone(false)
    }
    onToggle()
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    const targetProperty = isHorizontal ? 'width' : 'height'
    if (event.propertyName === targetProperty && event.target === event.currentTarget) {
      setIsAnimationDone(isOpen)
    }
  }

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
        shadow-[inset_-4px_0_4px_-4px,inset_0_4px_4px_-4px]
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
        {/* Горизонтальный заголовок: раскрытая панель или свёрнутая вертикальная */}
        {(isOpen || !isHorizontal) && (
          <h2 className="text-sm font-bold uppercase tracking-wider truncate pr-10 select-none text-base-content/80">
            {title}
          </h2>
        )}

        <PanelToggle
          className="absolute right-2 top-2"
          direction={direction}
          isOpen={isOpen}
          onOpen={handleToggle}
          title={title}
        />

        {/* Вертикальный заголовок только у свёрнутой горизонтальной панели */}
        {!isOpen && isHorizontal && (
          <span
            className="p-2 text-xs font-bold text-base-content/40 tracking-widest uppercase [writing-mode:vertical-lr] mt-8 select-none max-h-[calc(100vh-8rem)] overflow-hidden text-ellipsis whitespace-nowrap"
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
