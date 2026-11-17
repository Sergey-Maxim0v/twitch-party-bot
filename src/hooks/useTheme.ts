import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.ts'
import { DEFAULT_THEME_MODE } from '../constants/theme.constants.ts'
import { THEME_STORAGE_KEY } from '../constants/storage.constants.ts'
import { parseThemeMode } from './utils/parseThemeMode.ts'
import type { ThemeMode } from './types/theme.types.ts'

/**
 * Управляет темой оформления приложения и сохраняет выбор в localStorage.
 * Для режима `system` тема следует системным настройкам и обновляется при их изменении.
 *
 * @returns Текущий режим темы и функция для его изменения.
 */
export const useTheme = () => {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>(
    THEME_STORAGE_KEY,
    DEFAULT_THEME_MODE,
    { sanitize: parseThemeMode },
  )

  useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      if (themeMode === 'system') {
        root.setAttribute('data-theme', mediaQuery.matches ? 'dim' : 'nord')
        return
      }

      root.setAttribute('data-theme', themeMode)
    }

    applyTheme()

    if (themeMode === 'system') {
      mediaQuery.addEventListener('change', applyTheme)

      return () => {
        mediaQuery.removeEventListener('change', applyTheme)
      }
    }
  }, [themeMode])

  return { themeMode, setThemeMode }
}
