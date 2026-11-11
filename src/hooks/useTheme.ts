import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.ts'
import { THEME_OPTIONS } from '../constants/theme.constants.ts'
import { THEME_STORAGE_KEY } from '../constants/storage.constants.ts'
import type { ThemeConfig, ThemeMode } from './types/theme.types.ts'

const DEFAULT_THEME: ThemeConfig = THEME_OPTIONS.find(el => el.id === 'system') || THEME_OPTIONS[0]

/** Проверяет, что сохранённый режим темы всё ещё существует. */
const isThemeMode = (value: unknown): value is ThemeMode =>
  THEME_OPTIONS.some(option => option.id === value)

/**
 * Управляет темой оформления приложения и сохраняет выбор в localStorage.
 * Для режима `system` тема следует системным настройкам и обновляется при их изменении.
 *
 * @returns Текущий режим темы и функция для его изменения.
 */
export const useTheme = () => {
  const [storedThemeMode, setThemeMode] = useLocalStorage<ThemeMode>(THEME_STORAGE_KEY, DEFAULT_THEME.id)

  const themeMode = isThemeMode(storedThemeMode) ? storedThemeMode : DEFAULT_THEME.id

  useEffect(() => {
    if (storedThemeMode !== themeMode) {
      setThemeMode(themeMode)
    }
  }, [storedThemeMode, themeMode, setThemeMode])

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
