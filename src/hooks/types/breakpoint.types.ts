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

export type Breakpoint = typeof BREAKPOINTS[keyof typeof BREAKPOINTS]
