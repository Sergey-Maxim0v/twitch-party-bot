import { type FC, type ReactNode } from 'react'
import { useChannelInfoManager } from '../hooks/useChannelInfoManager.ts'
import { ChannelInfoContext } from './ChannelInfoInstance.ts'

interface ChannelInfoProviderProps {
  children: ReactNode;
}

/**
 * Провайдер сведений о текущем канале: роли аккаунта и ограничения доступа к чату.
 */
export const ChannelInfoProvider: FC<ChannelInfoProviderProps> = ({ children }) => {
  const channelInfo = useChannelInfoManager()

  return (
    <ChannelInfoContext.Provider value={channelInfo}>
      {children}
    </ChannelInfoContext.Provider>
  )
}
