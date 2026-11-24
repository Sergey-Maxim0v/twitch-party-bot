import { BREAKPOINTS, type Breakpoint } from '../../../../hooks/types/breakpoint.types.ts'

/** Ключ панели рабочего пространства. */
export type PanelKey = 'settings' | 'queue' | 'logs' | 'chat'

const PANEL_KEYS: PanelKey[] = ['settings', 'queue', 'logs', 'chat']

/** Пары панелей, переключающих фокус на средних брейкпоинтах. */
const MD_PAIRS: Record<PanelKey, PanelKey> = {
  settings: 'queue',
  queue: 'settings',
  logs: 'chat',
  chat: 'logs',
}

/** Пары панелей, переключающих фокус на широком брейкпоинте. */
const XL_PAIRS: Record<PanelKey, PanelKey | undefined> = {
  settings: 'logs',
  logs: 'settings',
  queue: undefined,
  chat: undefined,
}

export interface ResolvePanelToggleArgs {
  /** Текущий брейкпоинт экрана. */
  currentBreakpoint: Breakpoint;
  /** Панель, которую переключает пользователь. */
  target: PanelKey;
  /** Состояния раскрытия панелей. */
  isOpen: Record<PanelKey, boolean>;
  /** Обработчики изменения состояния панелей. */
  setOpen: Record<PanelKey, (isOpen: boolean) => void>;
}

/**
 * Переключает панель с учётом брейкпоинта: на мобильном открыта только одна панель,
 * на средних и широких экранах пары панелей поочерёдно делят место.
 */
export const resolvePanelToggle = ({
  currentBreakpoint,
  target,
  isOpen,
  setOpen,
}: ResolvePanelToggleArgs): void => {
  if (currentBreakpoint === BREAKPOINTS.SM) {
    PANEL_KEYS.forEach(key => setOpen[key](key === target ? !isOpen[target] : false))
    return
  }

  let pairKey: PanelKey | undefined

  if (currentBreakpoint === BREAKPOINTS.MD || currentBreakpoint === BREAKPOINTS.LG) {
    pairKey = MD_PAIRS[target]
  } else if (currentBreakpoint === BREAKPOINTS.XL) {
    pairKey = XL_PAIRS[target]
  }

  if (pairKey && isOpen[target] && !isOpen[pairKey]) {
    setOpen[target](false)
    setOpen[pairKey](true)
    return
  }

  setOpen[target](!isOpen[target])
}
