import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { type QueueState, type QueuePlayerFormData, type QueueType, QUEUE_TYPES } from '../types'
import type { LogSource } from '../../app-logs/types.ts'
import type { AppLogsContextValue } from '../../app-logs/context/AppLogsInstance.ts'
import { handleJoinPlayer } from '../utils/handleJoinPlayer.ts'
import { handleRemovePlayer } from '../utils/handleRemovePlayer.ts'
import { handleRemovePlayerFromAll } from '../utils/handleRemovePlayerFromAll.ts'
import { handleBanPlayer } from '../utils/handleBanPlayer.ts'
import { handleUnbanPlayer } from '../utils/handleUnbanPlayer.ts'
import { handleMovePlayer } from '../utils/handleMovePlayer.ts'
import { useQueueSettings } from '../../queue-settings/hooks/useQueueSettings.ts'
import { useQueueNotification } from '../../queue-notification/hooks/useQueueNotification.ts'
import { QUEUE_JOIN_STATUSES } from '../../../constants/queue.constants.ts'

interface UseQueuePlayersArgs {
  /** Функция обновления состояния очереди. */
  setState: Dispatch<SetStateAction<QueueState>>;
  /** Чтение актуального состояния очереди. */
  getState: () => QueueState;
  /** Текущий статус очереди. */
  isQueueOpen: boolean;
  /** Функция записи логов приложения. */
  pushLog: AppLogsContextValue['pushLog'];
  /** Функция балансировки активной очереди и списка ожидающих. */
  balanceQueues: (args: { source: LogSource; actorUsername: string }) => void;
}

/** Аргументы операций над игроками очереди. */
interface QueuePlayerCommandArgs {
  /** Никнейм игрока. */
  username: string;
  /** Отображаемое имя игрока. */
  displayedUsername?: string;
  /** Источник вызова команды. */
  source: LogSource;
  /** Никнейм того, кто выполнил операцию. */
  actorUsername: string;
}

/**
 * Хук управления игроками: добавление, удаление, бан и перемещение.
 */
export const useQueuePlayers = ({
  setState,
  getState,
  isQueueOpen,
  pushLog,
  balanceQueues,
}: UseQueuePlayersArgs) => {
  const { settings, updateSettings } = useQueueSettings()
  const { addJoinedUser, addWaitingUser, addDeletedUser, addMovedToActiveUser, addMovedToWaitingUser, addDeniedUser } = useQueueNotification()

  /** Синхронизирует списки очередей после изменения состава. */
  const balanceAfterChange = useCallback((args: { source: LogSource; actorUsername: string }) => {
    if (!settings.moveOnSizeChange) return

    balanceQueues({ source: args.source, actorUsername: args.actorUsername })
  }, [settings.moveOnSizeChange, balanceQueues])

  const addPlayerToQueue = useCallback((args: {
    playerData: QueuePlayerFormData;
    source: LogSource;
    actorUsername: string;
    rawCommand?: string;
    customTimestamp?: number;
  }) => {
    const result = handleJoinPlayer({ ...args, isQueueOpen, settings, getState, setState, pushLog })

    if (result.status === QUEUE_JOIN_STATUSES.JOINED) {
      addJoinedUser(args.playerData.username)
      return
    }

    if (result.status === QUEUE_JOIN_STATUSES.WAITING) {
      addWaitingUser(args.playerData.username)
      return
    }

    addDeniedUser(args.playerData.username)
  }, [isQueueOpen, settings, getState, setState, pushLog, addJoinedUser, addWaitingUser, addDeniedUser])

  const removePlayerFromQueue = useCallback((args: QueuePlayerCommandArgs & {
    userId: string;
    targetQueueType: QueueType;
    rawCommand?: string;
  }) => {
    handleRemovePlayer({ ...args, getState, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)
    balanceAfterChange(args)
  }, [getState, setState, pushLog, addDeletedUser, balanceAfterChange])

  const removePlayerFromAllQueues = useCallback((args: QueuePlayerCommandArgs & {
    userId: string;
    rawCommand?: string;
  }) => {
    handleRemovePlayerFromAll({ ...args, getState, setState, pushLog })
    addDeletedUser(args.displayedUsername ?? args.username)
    balanceAfterChange(args)
  }, [getState, setState, pushLog, addDeletedUser, balanceAfterChange])

  const banPlayerFromQueue = useCallback((args: QueuePlayerCommandArgs & {
    userId?: string;
  }) => {
    const { userId = '', source, actorUsername, username, displayedUsername } = args
    const { isBanned } = handleBanPlayer({ ...args, settings, updateSettings, pushLog })

    if (!isBanned) return

    removePlayerFromAllQueues({ userId, actorUsername, source, username, displayedUsername })
  }, [settings, updateSettings, pushLog, removePlayerFromAllQueues])

  const unbanPlayerFromQueue = useCallback((args: {
    username: string;
    source: LogSource;
    actorUsername: string;
  }) => {
    handleUnbanPlayer({ ...args, settings, updateSettings, pushLog })
  }, [settings, updateSettings, pushLog])

  const movePlayer = useCallback((args: QueuePlayerCommandArgs & {
    userId: string;
    targetQueueType: Exclude<QueueType, 'history'>;
    targetIndex: number | undefined;
  }) => {
    const decision = handleMovePlayer({ ...args, getState, setState, pushLog })

    if (decision.isMoved && decision.sourceQueueType !== args.targetQueueType) {
      const username = args.displayedUsername ?? args.username

      if (args.targetQueueType === QUEUE_TYPES.ACTIVE) {
        addMovedToActiveUser(username)
      } else {
        addMovedToWaitingUser(username)
      }
    }

    balanceAfterChange(args)
  }, [getState, setState, pushLog, addMovedToActiveUser, addMovedToWaitingUser, balanceAfterChange])

  return {
    addPlayerToQueue,
    removePlayerFromQueue,
    removePlayerFromAllQueues,
    banPlayerFromQueue,
    unbanPlayerFromQueue,
    movePlayer,
  }
}
