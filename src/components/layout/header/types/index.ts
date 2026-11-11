import type { STATUS_BADGE_TYPES } from '../../../../constants/ui.constants.ts'

/** Тип окраски индикатора статуса в стиле DaisyUI. */
export type StatusBadgeType = typeof STATUS_BADGE_TYPES[keyof typeof STATUS_BADGE_TYPES]

/** Описание индикатора статуса в шапке приложения. */
export interface StatusConfig {
  /** Короткое слово состояния. */
  statusText: string;
  /** Тип окраски индикатора. */
  badgeType: StatusBadgeType;
  /** Текст подробной подсказки при наведении. */
  tooltipText: string;
}
