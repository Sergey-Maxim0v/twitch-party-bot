import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { type QueueState, type QueuePlayerFormData, type QueueType, QUEUE_TYPES } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleJoinPlayer, JOIN_QUEUE_STATUSES } from '../utils/handleJoinPlayer.ts'
import { handleRemovePlayer } from '../utils/handleRemovePlayer.ts'
import { handleRemovePlayerFromAll } from '../utils/handleRemovePlayerFromAll.ts'
import { handleBanPlayer } from '../utils/handleBanPlayer.ts'
import { handleUnbanPlayer } from '../utils/handleUnbanPlayer.ts'
import { handleMovePlayer } from '../utils/handleMovePlayer.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'

interface UseQueuePlayersArgs {
  setState: Dispatch<SetStateAction<QueueState>>;
  isQueueOpen: boolean;
  pushLog: AppLogsContextValue['pushLog'];
  balanceQueues: (args: { source: LogSource; actorUsername: string }) => void;
}

export const useQueuePlayers = ({
  setState,
  isQueueOpen,
  pushLog,
  balanceQueues,
}: UseQueuePlayersArgs) => {
  const { settings, updateSettings } = useQueueSettings()
  const { addJoinedUser, addWaitingUser, addDeletedUser, addMovedUser, addDeniedUser } = useQueueNotification()

  const addPlayerToQueue = useCallback((args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => {
    const result = handleJoinPlayer({ ...args, isQueueOpen, settings, setState, pushLog })

    if (result.status === JOIN_QUEUE_STATUSES.JOINED) {
      addJoinedUser(args.playerData.username)
    } else if (result.status === JOIN_QUEUE_STATUSES.WAITING) {
      addWaitingUser(args.playerData.username)
    } else if (result.status === JOIN_QUEUE_STATUSES.DENIED) {
      addDeniedUser(args.playerData.username)
    }
  }, [isQueueOpen, settings, setState, pushLog, addJoinedUser, addWaitingUser, addDeniedUser])

  const removePlayerFromQueue = useCallback((args: {
    userId: string;
    username: string;
    targetQueueType: QueueType;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayer({ ...args, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)

    if (settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addDeletedUser])

  const removePlayerFromAllQueues = useCallback((args: {
    userId: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayerFromAll({ ...args, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)

    if (settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addDeletedUser])

  const banPlayerFromQueue = useCallback((args: {
    userId?: string;
    username: string;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    const { userId = '', source, actorUsername, username, displayedUsername } = args
    const { isBanned } = handleBanPlayer({ ...args, settings, updateSettings, pushLog })

    if (isBanned) {
      removePlayerFromAllQueues({ userId, actorUsername, source, username, displayedUsername })
    }

    if (isBanned && settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [settings, updateSettings, pushLog, removePlayerFromAllQueues, balanceQueues])

  const unbanPlayerFromQueue = useCallback((args: {
    username: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleUnbanPlayer({ ...args, settings, updateSettings, pushLog })
  }, [settings, updateSettings, pushLog])

  const movePlayer = useCallback((args: {
    userId: string;
    username: string;
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
    displayedUsername?: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleMovePlayer({ ...args, setState, pushLog })

    if (args.targetQueueType === QUEUE_TYPES.ACTIVE) {
      addMovedUser(args.displayedUsername ?? args.username)
    }

    if (settings.moveOnSizeChange) {
      balanceQueues({ source: args.source, actorUsername: args.actorUsername })
    }
  }, [setState, pushLog, settings.moveOnSizeChange, balanceQueues, addMovedUser])

  return {
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
  }
}
