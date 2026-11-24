import type { ReactNode } from 'react'

/** Проп с дополнительными CSS-классами элемента. */
export interface ClassNameProps {
  /** Дополнительные CSS-классы элемента. */
  className?: string;
}

/** Проп с дочерними элементами. */
export interface ChildrenProps {
  /** Дочерние элементы. */
  children: ReactNode;
}
