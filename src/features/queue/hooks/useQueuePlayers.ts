import { useCallback } from 'react'
import {
  QUEUE_TYPES,
  type MutableQueueType,
  type QueueActionContext,
  type QueueActionLog,
  type QueueActorContext,
  type QueueJoinResult,
  type QueuePlayerFormData,
  type QueueSetState,
  type QueueState,
  type QueueType,
} from '../types'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import type { BalanceQueuesArgs } from '../context/QueueInstance.ts'
import { handleJoinPlayer } from '../utils/handleJoinPlayer.ts'
import { handleRemovePlayer } from '../utils/handleRemovePlayer.ts'
import { handleRemovePlayerFromAll } from '../utils/handleRemovePlayerFromAll.ts'
import { handleBanPlayer } from '../utils/handleBanPlayer.ts'
import { handleUnbanPlayer } from '../utils/handleUnbanPlayer.ts'
import { handleMovePlayer } from '../utils/handleMovePlayer.ts'
import { getQueuePlayerName } from '../utils/queuePlayers.utils.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { QUEUE_JOIN_STATUSES } from '../../../constants/queue.constants.ts'

interface UseQueuePlayersArgs {
  setState: QueueSetState;
  getState: () => QueueState;
  isQueueOpen: boolean;
  pushLog: AppLogsContextValue['pushLog'];
  balanceQueues: (args: BalanceQueuesArgs) => void;
}

type QueuePlayerCommandArgs = QueueActionContext & {
  username: string;
  displayedUsername?: string;
}

export const useQueuePlayers = ({
  setState,
  getState,
  isQueueOpen,
  pushLog,
  balanceQueues,
}: UseQueuePlayersArgs) => {
  const { settings, updateSettings } = useQueueSettings()
  const {
    addJoinedUser,
    addWaitingUser,
    addDeletedUser,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeniedUser,
  } = useQueueNotification()

  const balanceAfterChange = useCallback((args: QueueActorContext) => {
    if (!settings.moveOnSizeChange) return

    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [settings.moveOnSizeChange, balanceQueues])

  const addPlayerToQueue = useCallback((args: QueueActionContext & {
    playerData: QueuePlayerFormData;
    customTimestamp?: number;
  }): QueueJoinResult => {
    const result = handleJoinPlayer({ ...args, isQueueOpen, settings, getState, setState, pushLog })

    if (result.status === QUEUE_JOIN_STATUSES.JOINED) {
      addJoinedUser(args.playerData.username)
    } else if (result.status === QUEUE_JOIN_STATUSES.WAITING) {
      addWaitingUser(args.playerData.username)
    } else {
      addDeniedUser(args.playerData.username)
    }

    return result
  }, [isQueueOpen, settings, getState, setState, pushLog, addJoinedUser, addWaitingUser, addDeniedUser])

  const removePlayerFromQueue = useCallback((args: QueuePlayerCommandArgs & {
    userId: string;
    targetQueueType: QueueType;
    rawCommand?: string;
  }) => {
    const result = handleRemovePlayer({ ...args, getState, setState, pushLog })

    if (result.isRemoved) {
      addDeletedUser(result.playerName)
    }

    balanceAfterChange(args)
  }, [getState, setState, pushLog, addDeletedUser, balanceAfterChange])

  const removePlayerFromAllQueues = useCallback((args: QueuePlayerCommandArgs & {
    userId: string;
  }): QueueActionLog => {
    const result = handleRemovePlayerFromAll({ ...args, getState, setState, pushLog })

    if (result.isRemoved) {
      addDeletedUser(result.playerName)
    }

    balanceAfterChange(args)

    return result
  }, [getState, setState, pushLog, addDeletedUser, balanceAfterChange])

  const banPlayerFromQueue = useCallback((args: QueuePlayerCommandArgs & {
    userId?: string;
  }) => {
    const { userId = '', source, actorUsername, username, displayedUsername } = args
    handleBanPlayer({ ...args, settings, updateSettings, pushLog })

    removePlayerFromAllQueues({ userId, actorUsername, source, username, displayedUsername })
  }, [settings, updateSettings, pushLog, removePlayerFromAllQueues])

  const unbanPlayerFromQueue = useCallback((args: QueueActorContext & { username: string }) => {
    handleUnbanPlayer({ ...args, settings, updateSettings, pushLog })
  }, [settings, updateSettings, pushLog])

  const movePlayer = useCallback((args: QueuePlayerCommandArgs & {
    queueEntryId: string;
    userId: string;
    sourceQueueType: MutableQueueType;
    targetQueueType: MutableQueueType;
    targetIndex: number | undefined;
  }) => {
    const decision = handleMovePlayer({
      ...args,
      maxQueueSize: settings.maxQueueSize,
      allowPreJoin: settings.allowPreJoin,
      getState,
      setState,
      pushLog,
    })

    if (decision.isNoop) return

    if (decision.isMoved && decision.sourceQueueType !== args.targetQueueType) {
      const username = args.displayedUsername ?? args.username
      const notify = args.targetQueueType === QUEUE_TYPES.ACTIVE ? addMovedToActiveUser : addMovedToWaitingUser

      notify(username)
    }

    if (decision.isMoved) {
      decision.displacedToWaiting.forEach(player => addMovedToWaitingUser(getQueuePlayerName(player)))
      decision.displacedRemoved.forEach(player => addDeletedUser(getQueuePlayerName(player)))
    }

    balanceAfterChange(args)
  }, [
    getState,
    setState,
    pushLog,
    settings.maxQueueSize,
    settings.allowPreJoin,
    addMovedToActiveUser,
    addMovedToWaitingUser,
    addDeletedUser,
    balanceAfterChange,
  ])

  return {
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
  }
}
