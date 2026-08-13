import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator, LogActorRole} from "../types";
import {LOG_STATUS} from "../types";

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
        status: typeof LOG_STATUS[keyof typeof LOG_STATUS],
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
        LOG_STATUS.INFO,
        initiator,
        actorUsername
    );
};
