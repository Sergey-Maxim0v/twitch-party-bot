import { type FC } from 'react'
import { useChannelInfoManager } from '../hooks/useChannelInfoManager.ts'
import { ChannelInfoContext } from './ChannelInfoInstance.ts'
import type { ChildrenProps } from '../../../types/common.types.ts'

/**
 * Провайдер сведений о текущем канале: роли аккаунта и ограничения доступа к чату.
 */
export const ChannelInfoProvider: FC<ChildrenProps> = ({ children }) => {
  const channelInfo = useChannelInfoManager()

  return (
    <ChannelInfoContext.Provider value={channelInfo}>
      {children}
    </ChannelInfoContext.Provider>
  )
}
