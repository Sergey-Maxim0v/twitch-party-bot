import type { ThemeMode } from '../hooks/types/theme.types.ts'
import { LuMoon, LuSun, LuSunMoon } from 'react-icons/lu'
import type { IconType } from 'react-icons'

/**
 * Иконки режимов темы оформления.
 */
export const THEME_MODE_ICONS: Record<ThemeMode, IconType> = {
  nord: LuSun,
  dim: LuMoon,
  system: LuSunMoon,
}
