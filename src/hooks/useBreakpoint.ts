import { useEffect, useState } from 'react'
import { type Breakpoint, BREAKPOINTS } from './types/breakpoint.types.ts'

/**
 * Хук для отслеживания текущего брейкпоинта экрана.
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(BREAKPOINTS.XXL)

  useEffect(() => {
    // Определяем медиа-запросы в соответствии с Tailwind CSS
    const queries = {
      '2xl': window.matchMedia('(min-width: 1536px)'),
      xl: window.matchMedia('(min-width: 1280px)'),
      lg: window.matchMedia('(min-width: 1024px)'),
      md: window.matchMedia('(min-width: 768px)'),
    }

    const currentContext = typeof window !== 'undefined'

    const updateBreakpoint = () => {
      if (!currentContext) return

      if (queries['2xl'].matches) setBreakpoint('2xl')
      else if (queries.xl.matches) setBreakpoint('xl')
      else if (queries.lg.matches) setBreakpoint('lg')
      else if (queries.md.matches) setBreakpoint('md')
      else setBreakpoint('sm')
    }

    // Инициализация при монтировании
    updateBreakpoint()

    // Подписываемся на изменения каждого брейкпоинта
    const listeners = Object.values(queries).map(q => {
      q.addEventListener('change', updateBreakpoint)
      return () => q.removeEventListener('change', updateBreakpoint)
    })

    return () => listeners.forEach(clean => clean())
  }, [])

  return breakpoint
}
