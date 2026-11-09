import { type FC } from 'react'
import { useSocketInit } from '../hooks/useSocketInit'

/**
 * Компонент для инициализации сокета.
 */
export const SocketInitializer: FC = () => {
  useSocketInit()
  return null
}
