import { type FC } from 'react'
import { useSocketContext } from '../../../services/socket/hooks/useSocketContext.ts'
import StatusIndicator from './StatusIndicator.tsx'
import { getNetworkConfig } from './utils/getNetworkConfig.ts'
import { getChatConfig } from './utils/getChatConfig.ts'

interface ConnectionStatusPanelProps {
  className?: string;
}

const ConnectionStatusPanel: FC<ConnectionStatusPanelProps> = ({ className = '' }) => {
  const { connectionStatus, chatAccessStatus } = useSocketContext()

  const network = getNetworkConfig(connectionStatus)
  const chat = getChatConfig(chatAccessStatus)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Индикатор сетевого соединения */}
      <StatusIndicator
        badgeType={network.badgeType}
        label="Сеть"
        statusText={network.statusText}
        tooltipText={network.tooltipText}
      />

      {/* Индикатор состояния чата */}
      <StatusIndicator
        badgeType={chat.badgeType}
        label="Чат"
        statusText={chat.statusText}
        tooltipText={chat.tooltipText}
      />
    </div>
  )
}

export default ConnectionStatusPanel
