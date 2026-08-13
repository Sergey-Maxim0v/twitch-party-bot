import type {Dispatch, SetStateAction} from "react";
import type {LogInitiator, QueueSession, QueueState} from "../types";
import {LOG_STATUS} from "../types";
import type {QueueSettings} from "../../queue-settings/types.ts";

export interface HandleFinishActiveQueueArgs {
    /** Источник вызова команды (обычно интерфейс стримера) */
    initiator: LogInitiator;
    /** Никнейм того, кто инициировал завершение */
    actorUsername: string;
    /** Текущие настройки очереди для лимита maxQueueSize */
    settings: QueueSettings;
    /** Функция обновления состояния */
    setState: Dispatch<SetStateAction<QueueState>>;
    /** Хелпер провайдера для записи логов */
    pushLog: (
        message: string,
        status: typeof LOG_STATUS[keyof typeof LOG_STATUS],
        initiator: LogInitiator,
        actorUsername: string
    ) => void;
}

/**
 * Хендлер для завершения текущей сессии, её архивации в историю,
 * фиксации кулдаунов участников и автоматического продвижения будущей очереди.
 */
export const handleFinishActiveQueue = ({
                                            initiator,
                                            actorUsername,
                                            settings,
                                            setState,
                                            pushLog
                                        }: HandleFinishActiveQueueArgs): void => {
    let playedPlayersCount = 0;
    let promotedPlayersCount = 0;
    let nextSessionNumber = 1;

    setState(prev => {
        // Если активная очередь пуста и будущая тоже пуста, делать нечего
        if (prev.activeQueue.length === 0 && prev.futureQueue.length === 0) {
            return prev;
        }

        playedPlayersCount = prev.activeQueue.length;
        const currentTimestamp = Date.now();
        nextSessionNumber = prev.globalSessionCounter + 1;

        const updatedPlayerHistory = {...prev.playerHistory};

        // 1. Фиксируем кулдауны для всех игроков, которые отыграли текущую сессию
        prev.activeQueue.forEach(player => {
            updatedPlayerHistory[player.userId] = {
                lastPlayedTimestamp: currentTimestamp,
                lastPlayedSessionNumber: nextSessionNumber
            };
        });

        // 2. Создаем объект сессии для отправки в историю
        const finishedSession: QueueSession = {
            id: `session_${currentTimestamp}_${Math.random().toString(36).substring(2, 7)}`,
            name: `Состав №${nextSessionNumber}`,
            createdAt: prev.activeQueue[0]?.timestamp || currentTimestamp,
            playedAt: currentTimestamp,
            players: prev.activeQueue
        };

        // 3. Вычисляем свободные места для ротации из будущей очереди
        const maxActiveSize = settings.maxQueueSize || 4;
        const updatedFuture = [...prev.futureQueue];

        // Забираем игроков из начала futureQueue и переносим в новую активную очередь
        const newlyPromoted = updatedFuture.splice(0, maxActiveSize);
        promotedPlayersCount = newlyPromoted.length;

        return {
            ...prev,
            activeQueue: newlyPromoted,
            futureQueue: updatedFuture,
            queueHistory: [finishedSession, ...prev.queueHistory],
            globalSessionCounter: nextSessionNumber,
            playerHistory: updatedPlayerHistory
        };
    });

    // 4. Формируем красивый информативный лог
    if (playedPlayersCount > 0 || promotedPlayersCount > 0) {
        const logMessage = `Состав №${nextSessionNumber} завершен (игроков: ${playedPlayersCount}). ` +
            `В активную очередь переведено игроков из ожидания: ${promotedPlayersCount}.`;

        pushLog(logMessage, LOG_STATUS.SUCCESS, initiator, actorUsername);
    } else {
        pushLog("Не удалось завершить сессию: очереди пусты.", LOG_STATUS.REJECTED, initiator, actorUsername);
    }
};
