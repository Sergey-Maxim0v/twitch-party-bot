import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator, LogActorRole} from "../types";
import {LOG_STATUS} from "../types";

export interface HandleClearFutureQueueArgs {
    /** Функция обновления состояния */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Источник вызова команды (чат/интерфейс) */
    initiator: LogInitiator;
    /** Никнейм того, кто очистил очередь */
    actorUsername: string;
    /** Роль исполнителя для понятного отображения в логах (стример, модератор, система, приложение) */
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
 * Хендлер для полной очистки списка игроков в будущих/ожидающих очередях.
 */
export const handleClearFutureQueue = ({
                                           setState,
                                           initiator,
                                           actorUsername,
                                           actorRole,
                                           pushLog
                                       }: HandleClearFutureQueueArgs): void => {
    setState(prev => ({
        ...prev,
        futureQueue: []
    }));

    const logMessage = `Будущие очереди очищены. Исполнитель: [${actorRole}] ${actorUsername}`;

    pushLog(
        logMessage,
        LOG_STATUS.INFO,
        initiator,
        actorUsername
    );
};
