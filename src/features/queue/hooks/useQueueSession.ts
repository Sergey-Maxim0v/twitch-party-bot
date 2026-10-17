import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QueueState } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleOpenQueue } from '../utils/handleOpenQueue.ts'
import { handleCloseQueue } from '../utils/handleCloseQueue.ts'
import { handleBalanceQueues } from '../utils/handleBalanceQueues.ts'
import { handleFinishActiveQueue } from '../utils/handleFinishActiveQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

interface UseQueueSessionArgs {
  setState: Dispatch<SetStateAction<QueueState>>;
  isQueueOpen: boolean;
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  pushLog: AppLogsContextValue['pushLog'];
}

export const useQueueSession = ({
  setState,
  isQueueOpen,
  setIsQueueOpen,
  pushLog,
}: UseQueueSessionArgs) => {
  const { settings } = useQueueSettings()
  const { sendMessage, sendMessageOpen, sendMessageClose, startNotificationCycle, stopNotificationCycle } = useQueueNotification()

  const balanceQueues = useCallback((args: {
    source: LogSource;
    actorUsername: string;
    overrideMaxQueueSize?: number;
    overrideMoveOnSizeChange?: boolean;
    overrideAllowPreJoin?: boolean;
  }) => {
    handleBalanceQueues({
      maxQueueSize: args.overrideMaxQueueSize ?? settings.maxQueueSize,
      moveOnSizeChange: args.overrideMoveOnSizeChange ?? settings.moveOnSizeChange,
      allowPreJoin: args.overrideAllowPreJoin ?? settings.allowPreJoin,
      setState,
      pushLog,
      source: args.source,
      actorUsername: args.actorUsername,
    })
  }, [settings, setState, pushLog])

  const openQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleOpenQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })
    sendMessageOpen()
    startNotificationCycle()
  }, [isQueueOpen, setIsQueueOpen, pushLog, sendMessageOpen, startNotificationCycle])

  // Добавляем опциональный параметр silent для предотвращения спама в чат
  const closeQueue = useCallback((args: { source: LogSource; actorUsername: string; silent?: boolean }) => {
    handleCloseQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })

    // Если вызван тихий режим, блокируем отправку сообщения
    if (!args.silent) {
      sendMessageClose()
    }

    stopNotificationCycle()
  }, [isQueueOpen, setIsQueueOpen, pushLog, sendMessageClose, stopNotificationCycle])

  const finishActiveQueue = useCallback((args: { source: LogSource; actorUsername: string }) => {
    handleFinishActiveQueue({
      setState,
      onSuccess: (playedPlayers, sessionNumber) => {
        const nicknames = playedPlayers
          .map(user => `@${user.displayedUsername ?? user.username}`)
          .join(', ')

        sendMessage(`Очередь завершена. Сейчас играют: ${nicknames}`)

        pushLog({
          message: `Состав №${sessionNumber} завершен (игроков: ${playedPlayers.length}).`,
          status: APP_LOG_STATUSES.WARNING,
          source: args.source,
          actorUsername: args.actorUsername,
        })

        if (isQueueOpen) {
          // Вызываем закрытие в "тихом" режиме
          closeQueue({ source: args.source, actorUsername: args.actorUsername, silent: true })
        }

        if (settings.moveOnSizeChange) {
          balanceQueues({ source: args.source, actorUsername: args.actorUsername })
        }
      },
      onEmpty: () => {
        pushLog({
          message: 'Не удалось завершить сессию: activeQueue пуста.',
          status: APP_LOG_STATUSES.WARNING,
          source: args.source,
          actorUsername: args.actorUsername,
        })
      },
    })
  }, [setState, sendMessage, pushLog, isQueueOpen, settings, closeQueue, balanceQueues])

  return { openQueue, closeQueue, finishActiveQueue, balanceQueues }
}
