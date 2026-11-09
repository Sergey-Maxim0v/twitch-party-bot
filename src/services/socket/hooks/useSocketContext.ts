import type { SocketStorage } from '../types.ts'
import { useContext } from 'react'
import { SocketInstance } from '../context/SocketInstance.ts'

/**
 * Хук для получения контекста сокета.
 */
export const useSocketContext = (): SocketStorage => {
  const context = useContext(SocketInstance)

  if (!context) {
    throw new Error('useSocketContext должен использоваться строго внутри SocketProvider')
  }

  return context
}
