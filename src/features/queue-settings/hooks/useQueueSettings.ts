import { useContext } from 'react'
import { QueueSettingsContext } from '../context/QueueSettingsInstance.ts'

/**
 * Хук для доступа к настройкам очереди.
 * @throws {Error} Если хук используется вне QueueSettingsProvider.
 */
export const useQueueSettings = () => {
  const context = useContext(QueueSettingsContext)
  if (!context) {
    throw new Error('useQueueSettings должен использоваться строго внутри QueueSettingsProvider')
  }
  return context
}
