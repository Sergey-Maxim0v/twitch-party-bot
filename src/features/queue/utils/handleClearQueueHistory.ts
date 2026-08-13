import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator, LogActorRole} from "../types";
import {LOG_STATUS} from "../types";

export interface HandleClearQueueHistoryArgs {
    /** Функция обновления состояния */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Источник вызова команды (чат/интерфейс) */
    initiator: LogInitiator;
    /** Никнейм того, кто очистил историю */
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
 * Хендлер для полной очистки истории сыгранных сессий (составов).
 */
export const handleClearQueueHistory = ({
                                            setState,
                                            initiator,
                                            actorUsername,
                                            actorRole,
                                            pushLog
                                        }: HandleClearQueueHistoryArgs): void => {
    setState(prev => ({
        ...prev,
        queueHistory: []
    }));

    const logMessage = `История сыгранных сессий очищена. Исполнитель: [${actorRole}] ${actorUsername}`;

    pushLog(
        logMessage,
        LOG_STATUS.INFO,
        initiator,
        actorUsername
    );
};
