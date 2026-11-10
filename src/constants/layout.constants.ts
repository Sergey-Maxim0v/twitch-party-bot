/**
 * Брейкпоинты сетки Tailwind CSS: sm — 640px, md — 768px, lg — 1024px, xl — 1280px, 2xl — 1536px.
 */
export const BREAKPOINTS = {
  /** 640px */
  SM: 'sm',

  /** 768px */
  MD: 'md',

  /** 1024px */
  LG: 'lg',

  /** 1280px */
  XL: 'xl',

  /** 1536px */
  XXL: '2xl',
} as const

/**
 * Направления раскладки панелей.
 */
export const PANEL_DIRECTIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} as const
