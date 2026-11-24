import { type FC } from 'react'
import type { ClassNameProps } from '../../../types/common.types.ts'

/**
 * Версия приложения, собранная из переменной окружения.
 */
export const Version: FC<ClassNameProps> = ({ className = '' }) => (
  <span className={`text-xs font-mono font-bold tracking-wider opacity-60 px-1.5 ${className}`}>
    v{import.meta.env.VITE_APP_VERSION}
  </span>
)
