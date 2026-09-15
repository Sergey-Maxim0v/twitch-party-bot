export const PANEL_DIRECTIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
} as const

export type PanelDirection = typeof PANEL_DIRECTIONS[keyof typeof PANEL_DIRECTIONS]
