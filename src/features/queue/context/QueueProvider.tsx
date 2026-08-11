import {type ReactNode, type FC} from "react";
import {QueueContext} from "./QueueInstance";
import type {QueueState, QueuePlayer, LogInitiator, LogStatus, QueueLogItem} from "../types";
import {useQueueSettings} from "../../queue-settings/hooks/useQueueSettings";
import {createInitialState} from "../utils/createInitialState";
import {STORAGE_KEY} from "../constants.ts";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import {handleJoinPlayer} from "../utils/handleJoinPlayer.ts";
import {handleLeavePlayer} from "../utils/handleLeavePlayer.ts";
import {handleClearCurrentSession} from "../utils/handleClearCurrentSession.ts";


interface QueueProviderProps {
    children: ReactNode;
}

export const QueueProvider: FC<QueueProviderProps> = ({children}) => {
    const {settings, updateSettings} = useQueueSettings();
    const [state, setState] = useLocalStorage<QueueState>(STORAGE_KEY, createInitialState());

    /**
     * Внутренний хелпер для добавления новой записи в лог
     */
    const pushLog = (
        message: string,
        status: LogStatus,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string,
        extractedNickname?: string | null
    ) => {
        const newLog: QueueLogItem = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: Date.now(),
            initiator,
            actorUsername,
            rawCommand,
            message,
            status,
            extractedGameNickname: extractedNickname
        };

        setState(prev => ({
            ...prev,
            logs: [newLog, ...prev.logs].slice(0, 200) // Ограничиваем историю до 200 логов
        }));
    };

    /**
     * МЕТОД: Присоединение игрока к очереди (вызывается из чата или UI)
     */
    const joinPlayer = (
        playerData: Omit<QueuePlayer, "timestamp">,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string
    ) => handleJoinPlayer({
        playerData,
        initiator,
        actorUsername,
        rawCommand,
        state,
        settings,
        setState,
        updateSettings,
        pushLog
    });

    /**
     * МЕТОД: Удалить игрока из определенной сессии
     */
    const leavePlayer = (
        userId: string,
        sessionId: string,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string
    ) => handleLeavePlayer({
        userId,
        sessionId,
        initiator,
        actorUsername,
        rawCommand,
        state,
        setState,
        pushLog
    });

    /**
     * МЕТОД: Отправить игрока в бан-лист
     */
    const banPlayer = (userId: string, username: string) => {
        console.log("banPlayer", userId, username);
    };

    /**
     * МЕТОД: Переместить игрока между сессиями
     */
    const movePlayer = (userId: string, fromSessionId: string, toSessionId: string, targetIndex?: number) => {
        console.log("movePlayer", userId, fromSessionId, toSessionId, targetIndex);
    };

    /**
     * МЕТОД: Завершить текущую сессию и сдвинуть очередь
     */
    const completeCurrentSession = () => {
        console.log("completeCurrentSession");
    };

    /**
     * МЕТОД: Полностью очистить текущую очередь
     */
    const clearCurrentSession = (initiator: LogInitiator, actorUsername: string) =>
        handleClearCurrentSession({
            initiator,
            actorUsername,
            state,
            setState,
            pushLog
        });

    /**
     * МЕТОД: Полностью сбросить все данные очереди
     */
    const resetAllQueues = () => {
        console.log("resetAllQueues");
    };

    const value = {
        state,
        joinPlayer,
        leavePlayer,
        banPlayer,
        movePlayer,
        completeCurrentSession,
        resetAllQueues,
        clearCurrentSession
    }

    return (
        <QueueContext.Provider value={value}>
            {children}
        </QueueContext.Provider>
    );
};
