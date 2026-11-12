import { type FC } from 'react'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import { SOCKET_CONNECTION_STATUSES, SOCKET_FAILURE_REASONS } from '../../../services/socket/types.ts'
import { CONNECTION_ACTION_TEXTS, RECONNECT_BUTTON_CLASS } from '../../../constants/ui.constants.ts'
import { StatusIndicator } from './StatusIndicator.tsx'
import { getNetworkConfig } from './utils/getNetworkConfig.ts'
import { getChatConfig } from './utils/getChatConfig.ts'

interface ConnectionStatusPanelProps {
  /** Дополнительные CSS-классы контейнера. */
  className?: string;
}

/**
 * Индикаторы состояния сетевого соединения и доступа к чату.
 */
export const ConnectionStatusPanel: FC<ConnectionStatusPanelProps> = ({ className = '' }) => {
  const { connectionStatus, chatAccessStatus, getClient, reconnect } = useSocketContext()

  const network = getNetworkConfig(connectionStatus)
  const chat = getChatConfig(chatAccessStatus)
  const isLimitReached = connectionStatus === SOCKET_CONNECTION_STATUSES.FAILED
    && getClient().failureReason === SOCKET_FAILURE_REASONS.LIMIT

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StatusIndicator
        badgeType={network.badgeType}
        label="Сеть"
        statusText={network.statusText}
        tooltipText={network.tooltipText}
      />

      <StatusIndicator
        badgeType={chat.badgeType}
        label="Чат"
        statusText={chat.statusText}
        tooltipText={chat.tooltipText}
      />

      {isLimitReached && (
        <button
          className={RECONNECT_BUTTON_CLASS}
          onClick={reconnect}
        >
          {CONNECTION_ACTION_TEXTS.RECONNECT}
        </button>
      )}
    </div>
  )
}
