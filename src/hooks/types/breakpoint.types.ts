import { BREAKPOINTS } from '../../constants/layout.constants.ts'

export { BREAKPOINTS }

/** Допустимый брейкпоинт сетки Tailwind CSS. */
export type Breakpoint = typeof BREAKPOINTS[keyof typeof BREAKPOINTS]
