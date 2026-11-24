import { type FC } from 'react'
import { useAppLogsObserver } from '../hooks/useAppLogsObserver.ts'
import type { ChildrenProps } from '../../../types/common.types.ts'

/**
 * Промежуточный компонент, гарантирующий легитимный доступ хука-обсервера
 * к уже инициализированному выше по дереву контексту AppLogsContext.
 */
export const AppLogsConsumerWrapper: FC<ChildrenProps> = ({ children }) => {
  useAppLogsObserver()

  return children
}
