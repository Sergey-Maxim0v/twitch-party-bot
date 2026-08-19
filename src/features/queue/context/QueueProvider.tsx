import {type ReactNode, type FC, useMemo, useCallback} from "react";
import {QueueContext} from "./QueueInstance";
import type {QueueContextValue} from "./QueueInstance";
import type {QueueState, QueuePlayer, LogInitiator, LogActorRole} from "../types";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings";
import {createInitialState} from "../utils/createInitialState";
import {STORAGE_KEY} from "../constants.ts";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import {handleClearActiveQueue} from "../utils/handleClearActiveQueue.ts";
import {handleClearFutureQueue} from "../utils/handleClearFutureQueue.ts";
import {handleClearQueueHistory} from "../utils/handleClearQueueHistory.ts";
import {handleRemovePlayer} from "../utils/handleRemovePlayer.ts";
import {handleRemovePlayerFromAll} from "../utils/handleRemovePlayerFromAll.ts";
import {handleBanPlayer} from "../utils/handleBanPlayer.ts";
import {handleMovePlayer} from "../utils/handleMovePlayer.ts";
import {handleFinishActiveQueue} from "../utils/handleFinishActiveQueue.ts";
import {handleJoinPlayer} from "../utils/handleJoinPlayer.ts";
import {useAppLogs} from "../../app-logs/hooks/useAppLogs.ts";
import type {AppLogStatus} from "../../app-logs/types.ts";

interface QueueProviderProps {
    children: ReactNode;
}

export const QueueProvider: FC<QueueProviderProps> = ({children}) => {
    const {settings, updateSettings} = useQueueSettings();
    const [state, setState] = useLocalStorage<QueueState>(STORAGE_KEY, createInitialState());
    const {pushLog: pushAppLog} = useAppLogs();

    const pushLog = useCallback((
        message: string,
        status: AppLogStatus,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string,
        extractedNickname?: string | null
    ) => {
        pushAppLog({
            message,
            status,
            initiator,
            actorUsername,
            rawCommand,
            extractedGameNickname: extractedNickname
        });
    }, [pushAppLog]);

    // === МЕТОДЫ ОЧИСТКИ (Clear) ===

    const clearActiveQueue = useCallback((args: {
        initiator: LogInitiator;
        actorUsername: string;
        actorRole: LogActorRole
    }) => {
        handleClearActiveQueue({...args, setState, pushLog});
    }, [setState, pushLog]);

    const clearFutureQueue = useCallback((args: {
        initiator: LogInitiator;
        actorUsername: string;
        actorRole: LogActorRole
    }) => {
        handleClearFutureQueue({...args, setState, pushLog});
    }, [setState, pushLog]);

    const clearQueueHistory = useCallback((args: {
        initiator: LogInitiator;
        actorUsername: string;
        actorRole: LogActorRole
    }) => {
        handleClearQueueHistory({...args, setState, pushLog});
    }, [setState, pushLog]);

    // === УПРАВЛЕНИЕ ИГРОКАМИ (CRUD) ===

    const addPlayerToQueue = useCallback((args: {
        playerData: Omit<QueuePlayer, "timestamp">;
        initiator: LogInitiator;
        actorUsername: string;
        actorRole: LogActorRole;
        rawCommand?: string;
        customTimestamp?: number;
    }) => {
        handleJoinPlayer({...args, state, settings, setState, pushLog});
    }, [state, settings, setState, pushLog]);

    const removePlayerFromQueue = useCallback((args: {
        userId: string;
        targetQueueType: 'active' | 'future';
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
    }) => {
        handleRemovePlayer({...args, setState, pushLog});
    }, [setState, pushLog]);

    const removePlayerFromAllQueues = useCallback((args: {
        userId: string;
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
    }) => {
        handleRemovePlayerFromAll({...args, setState, pushLog});
    }, [setState, pushLog]);

    const banPlayerFromQueue = useCallback((args: {
        userId?: string;
        username: string;
        displayedUsername?: string;
        initiator: LogInitiator;
        actorUsername: string;
    }) => {
        handleBanPlayer({...args, settings, updateSettings, setState, pushLog});
    }, [settings, updateSettings, setState, pushLog]);

    const movePlayer = useCallback((args: {
        userId: string;
        targetQueueType: 'active' | 'future';
        targetIndex: number | undefined;
        initiator: LogInitiator;
        actorUsername: string;
    }) => {
        handleMovePlayer({...args, setState, pushLog});
    }, [setState, pushLog]);

    // === ЖИЗНЕННЫЙ ЦИКЛ ОЧЕРЕДИ ===

    const finishActiveQueue = useCallback((args: { initiator: LogInitiator; actorUsername: string }) => {
        handleFinishActiveQueue({...args, settings, setState, pushLog});
    }, [settings, setState, pushLog]);

    const contextValue = useMemo<QueueContextValue>(() => ({
        activeQueue: state.activeQueue || [],
        futureQueue: state.futureQueue || [],
        queueHistory: state.queueHistory || [],
        rawState: state,
        clearActiveQueue,
        clearFutureQueue,
        clearQueueHistory,
        addPlayerToQueue,
        removePlayerFromQueue,
        removePlayerFromAllQueues,
        banPlayerFromQueue,
        movePlayer,
        finishActiveQueue
    }), [state, clearActiveQueue, clearFutureQueue, clearQueueHistory, addPlayerToQueue, removePlayerFromQueue, removePlayerFromAllQueues, banPlayerFromQueue, movePlayer, finishActiveQueue]);

    return <QueueContext.Provider value={contextValue}>{children}</QueueContext.Provider>;
};
