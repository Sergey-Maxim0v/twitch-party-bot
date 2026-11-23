import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QueueActionLog, QueueState } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { QUEUE_SESSION_LOG_MESSAGES } from '../../../constants/queue.constants.ts'
import { formatFinishedQueueMessage } from '../../queue-notification/utils/formatFinishedQueueMessage.ts'
import { handleOpenQueue } from '../utils/handleOpenQueue.ts'
import { handleCloseQueue } from '../utils/handleCloseQueue.ts'
import { handleBalanceQueues } from '../utils/handleBalanceQueues.ts'
import { handleFinishActiveQueue } from '../utils/handleFinishActiveQueue.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

/** Аргументы действия с очередью, инициированного пользователем или чатом. */
interface QueueSessionActionArgs {
  source: LogSource;
  actorUsername: string;
  /** Не писать запись в журнал: результат логирует вызывающая сторона. */
  silentLog?: boolean;
}

/** Аргументы автоматического закрытия очереди с указанием причины. */
interface AutoCloseQueueArgs extends QueueSessionActionArgs {
  message: string;
}

interface UseQueueSessionArgs {
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Текущий статус очереди. */
  isQueueOpen: boolean;
  /** Функция изменения статуса очереди. */
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  /** Канал, к которому привязывается открытая очередь. */
  activeChannel: string | null;
  /** Сохраняет канал, к которому привязана очередь. */
  setQueueChannel: Dispatch<SetStateAction<string | null>>;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog'];
}

/**
 * Управляет жизненным циклом очереди: открытие, закрытие,
 * завершение сессии и балансировка списков.
 */
export const useQueueSession = ({
  setState,
  getState,
  isQueueOpen,
  setIsQueueOpen,
  activeChannel,
  setQueueChannel,
  pushLog,
}: UseQueueSessionArgs) => {
  const { settings } = useQueueSettings()
  const {
    sendMessage,
    sendMessageOpen,
    sendMessageClose,
    clearBuffer,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeletedUser,
  } = useQueueNotification()

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
      prioritizeSubscribers: settings.prioritizeSubscribers,
      subscribersOnly: settings.subscribersOnly,
      cooldowns: settings,
      getState,
      setState,
      pushLog,
      source: args.source,
      actorUsername: args.actorUsername,
      onPlayersMovedToActive: usernames => {
        usernames.forEach(username => addMovedToActiveUser(username))
      },
      onPlayersMovedToWaiting: usernames => {
        usernames.forEach(username => addMovedToWaitingUser(username))
      },
      onPlayersRemoved: usernames => {
        usernames.forEach(username => addDeletedUser(username))
      },
    })
  }, [
    settings,
    getState,
    setState,
    pushLog,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeletedUser,
  ])

  const openQueue = useCallback((args: QueueSessionActionArgs): QueueActionLog => {
    const result = handleOpenQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })

    if (result.isOpened) {
      setQueueChannel(activeChannel)
      sendMessageOpen()
    }

    return result
  }, [activeChannel, isQueueOpen, setIsQueueOpen, pushLog, setQueueChannel, sendMessageOpen])

  const closeQueue = useCallback((args: QueueSessionActionArgs): QueueActionLog => {
    const result = handleCloseQueue({ ...args, isQueueOpen, setIsQueueOpen, pushLog })

    setQueueChannel(null)

    if (result.isClosed) {
      sendMessageClose()
    }

    return result
  }, [isQueueOpen, setIsQueueOpen, pushLog, setQueueChannel, sendMessageClose])

  /** Закрывает очередь и сбрасывает буфер уведомлений без сообщения в чат. */
  const autoCloseQueue = useCallback(({ source, actorUsername, message }: AutoCloseQueueArgs) => {
    if (!isQueueOpen) return

    setIsQueueOpen(false)
    setQueueChannel(null)
    clearBuffer()

    pushLog({
      message,
      status: APP_LOG_STATUSES.WARNING,
      source,
      actorUsername,
    })
  }, [isQueueOpen, setIsQueueOpen, pushLog, setQueueChannel, clearBuffer])

  const finishActiveQueue = useCallback((args: QueueSessionActionArgs): QueueActionLog => {
    const decision = handleFinishActiveQueue({ getState, setState })
    const logContext = { source: args.source, actorUsername: args.actorUsername }
    const result: QueueActionLog = decision.isEmpty
      ? { message: QUEUE_SESSION_LOG_MESSAGES.FINISHED_EMPTY, logStatus: APP_LOG_STATUSES.WARNING }
      : {
        message: QUEUE_SESSION_LOG_MESSAGES.FINISHED(decision.sessionNumber, decision.playedPlayers.length),
        logStatus: APP_LOG_STATUSES.WARNING,
      }

    if (!decision.isEmpty) {
      const nicknames = decision.playedPlayers.map(user => `@${user.displayedUsername ?? user.username}`)
      sendMessage(formatFinishedQueueMessage({ nicknames, prefix: settings.messagePrefix }))
    }

    if (!args.silentLog) {
      pushLog({ ...logContext, message: result.message, status: result.logStatus })
    }

    if (decision.isEmpty) return result

    if (isQueueOpen) {
      pushLog({
        ...logContext,
        message: QUEUE_SESSION_LOG_MESSAGES.AUTO_CLOSED_ON_FINISH,
        status: APP_LOG_STATUSES.INFO,
      })
      setIsQueueOpen(false)
      setQueueChannel(null)
      clearBuffer()
    }

    if (settings.moveOnSizeChange) {
      balanceQueues({
        actorUsername: args.actorUsername,
        overrideAllowPreJoin: true,
        source: args.source,
      })
    }

    return result
  }, [getState, setState, sendMessage, settings.messagePrefix, settings.moveOnSizeChange, pushLog, isQueueOpen, setQueueChannel, clearBuffer, setIsQueueOpen, balanceQueues])

  return { openQueue, closeQueue, autoCloseQueue, finishActiveQueue, balanceQueues }
}
