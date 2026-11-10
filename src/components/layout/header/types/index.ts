/** Тип окраски индикатора статуса в стиле DaisyUI. */
export type StatusBadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral'

/** Описание индикатора статуса в шапке приложения. */
export interface StatusConfig {
  /** Короткое слово состояния. */
  statusText: string;
  /** Тип окраски индикатора. */
  badgeType: StatusBadgeType;
  /** Текст подробной подсказки при наведении. */
  tooltipText: string;
}
