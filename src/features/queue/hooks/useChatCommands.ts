import { useEffect, useEffectEvent } from 'react'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueue } from './useQueue.ts'
import { useAppLogs } from '../../app-logs/hooks/useAppLogs.ts'
import type { ParsedIrcMessage } from '../../../services/twitch/types.ts'
import { useTwitchChat } from '../../../services/twitch/hooks/useTwitchChat.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { executeChatCommand } from '../utils/executeChatCommand.ts'

/** Подписывает обработчик команд на входящие сообщения чата. */
export const useChatCommands = () => {
  const { settings } = useQueueSettings()
  const { pushLog } = useAppLogs()
  const { subscribeToChatCommands } = useTwitchChat()
  const { sendCurrentQueueStatus, sendClearAll } = useQueueNotification()
  const {
    openQueue,
    closeQueue,
    addPlayerToQueue,
    removePlayerFromAllQueues,
    clearActiveQueue,
    clearWaitingQueue,
    finishActiveQueue,
  } = useQueue()

  const handleChatCommand = useEffectEvent((message: ParsedIrcMessage) => {
    executeChatCommand({
      message,
      settings,
      pushLog,
      sendCurrentQueueStatus,
      sendClearAll,
      openQueue,
      closeQueue,
      addPlayerToQueue,
      removePlayerFromAllQueues,
      clearActiveQueue,
      clearWaitingQueue,
      finishActiveQueue,
    })
  })

  useEffect(() => subscribeToChatCommands(handleChatCommand), [subscribeToChatCommands])
}
