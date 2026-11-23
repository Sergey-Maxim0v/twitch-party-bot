import type { Dispatch, SetStateAction } from 'react'
import { APP_LOG_STATUSES } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import {
  QUEUE_CLEAR_MESSAGES,
  QUEUE_SESSION_LOG_MESSAGES,
} from '../../../constants/queue.constants.ts'
import type { QueueActionContext, QueueActionLog, QueueHandlerArgs } from '../types.ts'

type QueueSessionStateArgs = QueueActionContext & {
  isQueueOpen: boolean;
  setIsQueueOpen: Dispatch<SetStateAction<boolean>>;
  pushLog: AppLogsContextValue['pushLog'];
}

type HandleCloseQueueArgs = QueueSessionStateArgs & {
  message?: string;
}

interface OpenQueueResult extends QueueActionLog {
  isOpened: boolean;
}

interface CloseQueueResult extends QueueActionLog {
  isClosed: boolean;
}

const pushResultLog = ({
  result,
  pushLog,
  source,
  actorUsername,
  silentLog = false,
}: QueueActionContext & {
  result: QueueActionLog;
  pushLog: AppLogsContextValue['pushLog'];
}): void => {
  if (silentLog) return

  pushLog({
    message: result.message,
    status: result.logStatus,
    source,
    actorUsername,
  })
}

export const handleOpenQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  pushLog,
  source,
  actorUsername,
  silentLog,
}: QueueSessionStateArgs): OpenQueueResult => {
  const isOpened = !isQueueOpen

  if (isOpened) {
    setIsQueueOpen(true)
  }

  const result: OpenQueueResult = {
    isOpened,
    message: isOpened ? QUEUE_SESSION_LOG_MESSAGES.OPENED : QUEUE_SESSION_LOG_MESSAGES.ALREADY_OPENED,
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  pushResultLog({ result, pushLog, source, actorUsername, silentLog })

  return result
}

export const handleCloseQueue = ({
  isQueueOpen,
  setIsQueueOpen,
  pushLog,
  source,
  actorUsername,
  silentLog,
  message = QUEUE_SESSION_LOG_MESSAGES.CLOSED,
}: HandleCloseQueueArgs): CloseQueueResult => {
  const isClosed = isQueueOpen

  if (isClosed) {
    setIsQueueOpen(false)
  }

  const result: CloseQueueResult = {
    isClosed,
    message: isClosed ? message : QUEUE_SESSION_LOG_MESSAGES.ALREADY_CLOSED,
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  pushResultLog({ result, pushLog, source, actorUsername, silentLog })

  return result
}

export const handleClearActiveQueue = ({
  setState,
  pushLog,
  source,
  actorUsername,
  silentLog,
}: QueueHandlerArgs): QueueActionLog => {
  setState(prev => ({
    ...prev,
    activeQueue: [],
  }))

  const result: QueueActionLog = {
    message: QUEUE_CLEAR_MESSAGES.ACTIVE,
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  pushResultLog({ result, pushLog, source, actorUsername, silentLog })

  return result
}

export const handleClearWaitingQueue = ({
  getState,
  setState,
  pushLog,
  source,
  actorUsername,
  silentLog,
}: QueueHandlerArgs): QueueActionLog => {
  const waitingCount = getState().waitingQueue.length

  setState(prev => ({
    ...prev,
    waitingQueue: [],
  }))

  const result: QueueActionLog = {
    message: QUEUE_CLEAR_MESSAGES.WAITING
      + (waitingCount ? QUEUE_CLEAR_MESSAGES.REMOVED_PLAYERS(waitingCount) : ''),
    logStatus: APP_LOG_STATUSES.WARNING,
  }

  pushResultLog({ result, pushLog, source, actorUsername, silentLog })

  return result
}

/** Обнуляет историю сессий, счётчик и все кулдауны игроков. */
export const handleClearQueueHistory = ({
  setState,
  source,
  actorUsername,
  pushLog,
}: QueueHandlerArgs): void => {
  setState(prev => ({
    ...prev,
    queueHistory: [],
    globalSessionCounter: 0,
    playerHistory: {},
  }))

  pushLog({
    message: QUEUE_CLEAR_MESSAGES.HISTORY,
    status: APP_LOG_STATUSES.WARNING,
    source,
    actorUsername,
  })
}
