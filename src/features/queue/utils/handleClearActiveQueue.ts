import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator, LogActorRole} from "../types";
import {APP_LOG_STATUSES} from "../../app-logs/types.ts";

export interface HandleClearActiveQueueArgs {
    /** Функция обновления состояния */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Источник вызова команды (чат/интерфейс) */
    initiator: LogInitiator;
    /** Никнейм того, кто очистил очередь */
    actorUsername: string;
    /** Роль исполнителя для понятного отображения в логах (Стример, Модератор, Система) */
    actorRole: LogActorRole;
    /** Хелпер провайдера для записи логов */
    pushLog: (
        message: string,
        status: AppLogStatus,
        initiator: LogInitiator,
        actorUsername: string
    ) => void;
}

/**
 * Хендлер для полной очистки списка игроков в текущей активной очереди.
 */
export const handleClearActiveQueue = ({
                                           setState,
                                           initiator,
                                           actorUsername,
                                           actorRole,
                                           pushLog
                                       }: HandleClearActiveQueueArgs): void => {
    setState(prev => ({
        ...prev,
        activeQueue: []
    }));

    const logMessage = `Текущая очередь очищена. Исполнитель: [${actorRole}] ${actorUsername}`;

    pushLog(
        logMessage,
        APP_LOG_STATUSES.INFO,
        initiator,
        actorUsername
    );
};
