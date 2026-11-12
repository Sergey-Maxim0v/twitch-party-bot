import { useEffect, type RefObject } from 'react'
import { SOCKET_CONNECTION_STATUSES } from '../types.ts'
import type { ChatAccessStatus, ConnectionStatus } from '../types.ts'
import { SOCKET_STATUS_WATCHDOG_TIMEOUT_MS } from '../../../constants/socket.constants.ts'
import type { TwitchIrcClient } from '../../twitch/twitchIrcClient.ts'

interface UseSocketWatchdogProps {
  client: TwitchIrcClient;
  connectionStatus: ConnectionStatus;
  lastActiveChatStatusRef: RefObject<ChatAccessStatus>;
  setChatAccessStatus: (status: ChatAccessStatus) => void;
}

/**
 * Сторож статуса соединения: синхронизирует зависший статус с фактическим состоянием сокета.
 */
export const useSocketWatchdog = ({
  client,
  connectionStatus,
  lastActiveChatStatusRef,
  setChatAccessStatus,
}: UseSocketWatchdogProps): void => {
  useEffect(() => {
    if (connectionStatus !== SOCKET_CONNECTION_STATUSES.CONNECTING) return

    const timer = setTimeout(() => {
      if (client.status !== SOCKET_CONNECTION_STATUSES.CONNECTED) return

      client.syncStatus()
      setChatAccessStatus(lastActiveChatStatusRef.current)
    }, SOCKET_STATUS_WATCHDOG_TIMEOUT_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [client, connectionStatus, lastActiveChatStatusRef, setChatAccessStatus])
}
