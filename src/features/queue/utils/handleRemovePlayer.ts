import type {Dispatch, SetStateAction} from "react";
import type {QueueState, LogInitiator} from "../types";
import {APP_LOG_STATUSES, type AppLogStatus} from "../../app-logs/types.ts";

export interface HandleRemovePlayerArgs {
    /** Уникальный ID пользователя на Twitch для удаления */
    userId: string;
    /** Из какой именно очереди нужно удалить игрока */
    targetQueueType: 'active' | 'future';
    /** Источник вызова команды (чат/интерфейс) */
    initiator: LogInitiator;
    /** Никнейм того, кто выполнил удаление */
    actorUsername: string;
    /** Исходный текст команды (если вызвано из чата) */
    rawCommand?: string;
    /** Функция обновления состояния */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Хелпер провайдера для записи логов */
    pushLog: (
        message: string,
        status: AppLogStatus,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string
    ) => void;
}

/**
 * Хендлер для удаления ПЕРВОЙ НАЙДЕННОЙ записи игрока из КОНКРЕТНОЙ очереди (активной или будущей).
 */
export const handleRemovePlayer = ({
                                       userId,
                                       targetQueueType,
                                       initiator,
                                       actorUsername,
                                       rawCommand,
                                       setState,
                                       pushLog
                                   }: HandleRemovePlayerArgs): void => {
    let targetPlayerName = "";
    let isRemoved = false;

    setState(prev => {
        const isTargetActive = targetQueueType === 'active';
        const queueToSearch = isTargetActive ? prev.activeQueue : prev.futureQueue;

        const index = queueToSearch.findIndex(p => p.userId === userId);

        if (index === -1) return prev; // Если в целевой очереди нет игрока, стейт не меняем

        targetPlayerName = queueToSearch[index].displayedUsername || queueToSearch[index].username;
        isRemoved = true;

        if (isTargetActive) {
            const updatedActive = [...prev.activeQueue];
            updatedActive.splice(index, 1);
            return {...prev, activeQueue: updatedActive};
        } else {
            const updatedFuture = [...prev.futureQueue];
            updatedFuture.splice(index, 1);
            return {...prev, futureQueue: updatedFuture};
        }
    });

    const queueLabel = targetQueueType === 'active' ? "активной очереди" : "будущей очереди";

    if (isRemoved) {
        const logMessage = `Игрок ${targetPlayerName} удален из ${queueLabel}.`;
        pushLog(logMessage, APP_LOG_STATUSES.SUCCESS, initiator, actorUsername, rawCommand);
    } else {
        const logMessage = `Ошибка удаления: игрок с ID ${userId} не найден в ${queueLabel}.`;
        pushLog(logMessage, APP_LOG_STATUSES.ERROR, initiator, actorUsername, rawCommand);
    }
};
