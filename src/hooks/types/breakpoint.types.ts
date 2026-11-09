import { BREAKPOINTS } from '../../constants/layout.constants.ts'

export { BREAKPOINTS }

export type Breakpoint = typeof BREAKPOINTS[keyof typeof BREAKPOINTS]
