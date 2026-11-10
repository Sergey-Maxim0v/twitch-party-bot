import { PANEL_DIRECTIONS } from '../../../../constants/layout.constants.ts'

export { PANEL_DIRECTIONS }

/** Направление раскладки панели. */
export type PanelDirection = typeof PANEL_DIRECTIONS[keyof typeof PANEL_DIRECTIONS]
