/** Режим темы: конкретная тема или следование системным настройкам. */
export type ThemeMode = 'nord' | 'dim' | 'system'

/** Описание варианта темы для селектора. */
export interface ThemeConfig {
  id: ThemeMode;
  description: string
}
