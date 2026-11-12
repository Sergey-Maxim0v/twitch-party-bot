import { useEffect } from 'react'
import { TWITCH_CHAT_ACCESS_STATUSES, type ChatAccessStatus } from '../types.ts'
import type { TwitchIrcClient } from '../../twitch/twitchIrcClient.ts'

interface UseSocketNetworkSyncProps {
  client: TwitchIrcClient;
  setChatAccessStatus: (status: ChatAccessStatus) => void;
}

/**
 * Изолированный хук для контроля сетевого статуса ОС (online/offline).
 */
export const useSocketNetworkSync = ({
  client,
  setChatAccessStatus,
}: UseSocketNetworkSyncProps): void => {
  useEffect(() => {
    const handleOffline = (): void => {
      client.handleNetworkOffline()
      setChatAccessStatus(TWITCH_CHAT_ACCESS_STATUSES.OFFLINE)
    }

    const handleOnline = (): void => {
      client.handleNetworkOnline()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [client, setChatAccessStatus])
}
