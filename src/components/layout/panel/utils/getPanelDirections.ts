import { PANEL_DIRECTIONS, type PanelDirection } from '../types'
import { type Breakpoint, BREAKPOINTS } from '../../../../hooks/types/breakpoint.types.ts'

export type WorkspaceDirections = Record<'settings' | 'queue' | 'logs' | 'chat', PanelDirection>

/**
 * Вычисление направления сворачивания (direction) для каждой панели
 * на основе текущего брейкпоинта экрана.
 */
export const getPanelDirections = (currentBreakpoint: Breakpoint): WorkspaceDirections => {
  switch (currentBreakpoint) {
    case BREAKPOINTS.SM:
      return {
        settings: PANEL_DIRECTIONS.VERTICAL,
        queue: PANEL_DIRECTIONS.VERTICAL,
        logs: PANEL_DIRECTIONS.VERTICAL,
        chat: PANEL_DIRECTIONS.VERTICAL,
      }
    case BREAKPOINTS.MD:
    case BREAKPOINTS.LG:
      return {
        settings: PANEL_DIRECTIONS.VERTICAL,
        queue: PANEL_DIRECTIONS.VERTICAL,
        logs: PANEL_DIRECTIONS.VERTICAL,
        chat: PANEL_DIRECTIONS.VERTICAL,
      }
    case BREAKPOINTS.XL:
      return {
        settings: PANEL_DIRECTIONS.VERTICAL,
        queue: PANEL_DIRECTIONS.HORIZONTAL,
        logs: PANEL_DIRECTIONS.VERTICAL,
        chat: PANEL_DIRECTIONS.HORIZONTAL,
      }
    case BREAKPOINTS.XXL:
    default:
      return {
        settings: PANEL_DIRECTIONS.HORIZONTAL,
        queue: PANEL_DIRECTIONS.HORIZONTAL,
        logs: PANEL_DIRECTIONS.HORIZONTAL,
        chat: PANEL_DIRECTIONS.HORIZONTAL,
      }
  }
}
