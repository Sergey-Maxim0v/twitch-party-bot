import type { FC } from 'react'

interface VersionProps {
  className?: string
}

const Version: FC<VersionProps> = ({ className }) => {
  return (
    <span className={'text-xs font-mono font-bold tracking-wider opacity-60 px-1.5'
          + ` ${className ?? ''}`}
    >
      v{import.meta.env.VITE_APP_VERSION}
    </span>
  )
}

export default Version
