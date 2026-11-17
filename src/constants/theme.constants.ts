import type { ThemeConfig, ThemeMode } from '../hooks/types/theme.types.ts'

/**
 * Доступные темы оформления для переключателя темы.
 */
export const THEME_OPTIONS: ThemeConfig[] = [
  { id: 'nord', description: 'Светлая' },
  { id: 'dim', description: 'Темная' },
  { id: 'system', description: 'Системная' },
]

/**
 * Режим темы по умолчанию: следование системным настройкам.
 */
export const DEFAULT_THEME_MODE: ThemeMode =
  THEME_OPTIONS.find(option => option.id === 'system')?.id ?? THEME_OPTIONS[0].id
