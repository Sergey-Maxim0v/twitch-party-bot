import type { FC, ReactNode } from 'react'

export interface QueueCollapseProps {
  className?: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

const QueueCollapse: FC<QueueCollapseProps> = ({
  className = '',
  title,
  open,
  onOpenChange,
  children,
  badge,
  disabled = false,
}) => {
  const collapseStatusClass =
    disabled ? 'collapse-close' : (open ? 'collapse-open' : 'collapse-close')

  const arrowClass = disabled ? '' : 'collapse-arrow'

  return (
    <div
      className={`collapse border border-base-300 bg-base-200 rounded-lg transition-all overflow-hidden 
      ${ disabled ? 'opacity-70 pointer-events-none select-none bg-base-300/30' : '' }
      ${arrowClass} ${collapseStatusClass} ${className}`}
    >
      <div
        className={'collapse-title text-sm font-medium flex items-center justify-between cursor-pointer ' +
            'select-none min-h-0 py-3 px-4'}
        onClick={() => {
          if (!disabled) {
            onOpenChange(!open)
          }
        }}
      >
        <span className={`text-xs font-bold tracking-wide text-base-content/60 uppercase 
          ${disabled ? 'text-base-content/40' : ''}`}
        >
          {title}
        </span>
        {badge && <div className="mr-6 shrink-0">{badge}</div>}
      </div>

      <div className="collapse-content p-0">
        <div className="p-4 pt-0 border-t border-base-300/50 mt-3">
          {children}
        </div>
      </div>
    </div>
  )
}

export default QueueCollapse
