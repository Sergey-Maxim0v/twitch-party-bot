import { type FC, type ReactNode, type TransitionEvent, useState } from 'react'
import { PanelToggle } from './PanelToggle.tsx'
import { PANEL_DIRECTIONS, type PanelDirection } from './types'
import { PANEL_TRANSITION_PROPERTIES } from '../../../constants/layout.constants.ts'

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
 * Панель с кнопкой сворачивания.
 *
 * Содержимое не размонтируется, а скрывается, поэтому обработчики внутри панели
 * продолжают работать при её сворачивании.
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
  const transitionProperty = isHorizontal
    ? PANEL_TRANSITION_PROPERTIES.HORIZONTAL
    : PANEL_TRANSITION_PROPERTIES.VERTICAL

  const handleToggle = () => {
    if (isOpen) {
      setIsAnimationDone(false)
    }
    onToggle()
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (event.propertyName !== transitionProperty || event.target !== event.currentTarget) return
    setIsAnimationDone(isOpen)
  }

  let sizeClasses: string
  if (isOpen) {
    sizeClasses = `${isHorizontal ? 'w-80 h-full' : 'w-full h-80'} ${className}`
  } else {
    sizeClasses = `${isHorizontal ? 'w-12 h-full bg-base-300' : 'w-full h-12 bg-base-300'} ${collapsedClassName}`
  }

  let headerClasses: string
  if (isOpen) {
    headerClasses = 'justify-between'
  } else if (isHorizontal) {
    headerClasses = 'flex-col pt-2 pb-4 h-auto'
  } else {
    headerClasses = 'flex-row items-center'
  }

  const contentClasses = isOpen
    ? `transition-opacity duration-300 ease-in-out ${isAnimationDone ? 'opacity-100' : 'opacity-0'}`
    : 'hidden'

  return (
    <section
      className={`
        flex flex-col bg-base-200 relative border-r border-base-300
        transition-all duration-300 ease-in-out
        after:pointer-events-none after:absolute after:inset-0 after:z-20
        after:shadow-[inset_-6px_0_12px_-6px_rgba(0,0,0,0.18),inset_0_6px_12px_-6px_rgba(0,0,0,0.18)]
        [:where([data-theme=dim])_&]:after:shadow-[inset_-6px_0_12px_-6px_rgba(0,0,0,0.3),inset_0_6px_12px_-6px_rgba(0,0,0,0.3)]
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

        {!isOpen && isHorizontal && (
          <span
            className="p-2 text-xs font-bold text-base-content/40 tracking-widest uppercase [writing-mode:vertical-lr] mt-8 select-none max-h-[calc(100vh-8rem)] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {title}
          </span>
        )}
      </div>

      <div className={`flex flex-col h-full w-full pt-14 overflow-hidden ${contentClasses}`}>
        {children}
      </div>
    </section>
  )
}
