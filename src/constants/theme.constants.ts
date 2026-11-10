import type { ThemeConfig } from '../hooks/types/theme.types.ts'

/**
 * Доступные темы оформления для переключателя темы.
 */
export const THEME_OPTIONS: ThemeConfig[] = [
  { id: 'nord', description: 'Светлая' },
  { id: 'dim', description: 'Темная' },
  { id: 'system', description: 'Системная' },
]
