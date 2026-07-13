export type ThemeMode = 'light' | 'dark' | 'dim' | 'system';

export interface ThemeConfig {
    id: ThemeMode;
    label: string;
}
