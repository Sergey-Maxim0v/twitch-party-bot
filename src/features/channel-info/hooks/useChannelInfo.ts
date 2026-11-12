import { useContext } from 'react'
import { ChannelInfoContext, type ChannelInfoContextType } from '../context/ChannelInfoInstance.ts'

/**
 * Хук для доступа к сведениям о текущем канале из контекста.
 *
 * @returns Роли аккаунта, ограничения чата и состояние подключения.
 * @throws {Error} Если хук вызван вне `ChannelInfoProvider`.
 */
export const useChannelInfo = (): ChannelInfoContextType => {
  const context = useContext(ChannelInfoContext)

  if (!context) {
    throw new Error('useChannelInfo must be used within a ChannelInfoProvider')
  }

  return context
}
