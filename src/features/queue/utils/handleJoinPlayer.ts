import type {Dispatch, SetStateAction} from "react";
import type {QueueState, QueuePlayer, LogInitiator, LogActorRole} from "../types";
import {LOG_STATUS} from "../types";
import {validateQueueEntry} from "./validateQueueEntry";
import {extractGameNickname} from "./extractGameNickname";
import type {QueueSettings} from "../../queue-settings/types.ts";

export interface HandleJoinPlayerArgs {
    playerData: Omit<QueuePlayer, "timestamp">;
    initiator: LogInitiator;
    actorUsername: string;
    actorRole: LogActorRole;
    rawCommand?: string;
    customTimestamp?: number;
    state: QueueState;
    settings: QueueSettings;
    setState: Dispatch<SetStateAction<QueueState>>;
    pushLog: (
        message: string,
        status: typeof LOG_STATUS[keyof typeof LOG_STATUS],
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string,
        extractedNickname?: string | null
    ) => void;
}

/**
 * Хендлер для добавления игрока в активную или будущую очередь со всеми бизнес-проверками.
 */
export const handleJoinPlayer = ({
                                     playerData,
                                     initiator,
                                     actorUsername,
                                     actorRole,
                                     rawCommand,
                                     customTimestamp,
                                     state,
                                     settings,
                                     setState,
                                     pushLog
                                 }: HandleJoinPlayerArgs): void => {
    const timestamp = customTimestamp || Date.now();
    const userId = playerData.userId;
    const username = playerData.username;
    const isSubscriber = playerData.isSubscriber;
    const displayName = playerData.displayedUsername || username;

    // 1. Запуск валидации ограничений (кулдауны, бан-листы, открыта ли очередь)
    const validationError = validateQueueEntry({userId, username, isSubscriber, actorRole, state, settings});
    if (validationError) {
        pushLog(validationError, LOG_STATUS.REJECTED, initiator, actorUsername, rawCommand);
        return;
    }

    // 2. Извлечение игрового никнейма с помощью внешней утилиты
    const extractedNickname = playerData.gameNickname || extractGameNickname({
        rawMessage: playerData.rawMessage,
        gameConfig: settings.currentGame
    });

    const fullPlayer: QueuePlayer = {...playerData, timestamp, gameNickname: extractedNickname};
    let finalLogMessage = "";
    let isSuccess = false;

    setState(prev => {
        const maxActiveSize = settings.maxQueueSize || 4;
        const existsInActive = prev.activeQueue.some(p => p.userId === userId);
        const existsInFuture = prev.futureQueue.some(p => p.userId === userId);

        // Проверка на дубликаты
        if (!settings.allowMultipleEntries) {
            if (existsInActive || existsInFuture) {
                finalLogMessage = `отклонено: игрок ${displayName} уже находится в очереди`;
                return prev;
            }
        } else if (existsInActive && !settings.allowPreJoin) {
            finalLogMessage = `отклонено: игрок ${displayName} уже в активной очереди, предзапись закрыта`;
            return prev;
        }

        const updatedActive = [...prev.activeQueue];
        const updatedFuture = [...prev.futureQueue];

        // А) Вставка в АКТИВНУЮ очередь
        if (updatedActive.length < maxActiveSize && !existsInActive) {
            if (settings.prioritizeSubscribers && isSubscriber) {
                const firstNonSubIdx = updatedActive.findIndex(p => !p.isSubscriber);
                const insertIdx = firstNonSubIdx === -1 ? updatedActive.length : firstNonSubIdx;
                updatedActive.splice(insertIdx, 0, fullPlayer);
            } else {
                updatedActive.push(fullPlayer);
            }
            finalLogMessage = `Игрок ${displayName} добавлен в активную очередь.`;
            isSuccess = true;
            return {...prev, activeQueue: updatedActive};
        }

        // Б) Вставка в БУДУЩУЮ очередь
        if (!settings.allowPreJoin) {
            finalLogMessage = `отклонено: активная очередь заполнена, а будущие очереди отключены`;
            return prev;
        }

        if (!settings.allowMultipleEntries && existsInFuture) {
            finalLogMessage = `отклонено: игрок ${displayName} уже ожидает в будущей очереди`;
            return prev;
        }

        if (settings.allowMultipleEntries && prev.futureQueue.some((p, idx) => p.userId === userId && idx >= prev.futureQueue.length - maxActiveSize)) {
            finalLogMessage = `отклонено: нельзя записаться несколько раз подряд в один состав`;
            return prev;
        }

        if (settings.prioritizeSubscribers && isSubscriber) {
            const firstNonSubIdx = updatedFuture.findIndex(p => !p.isSubscriber);
            const insertIdx = firstNonSubIdx === -1 ? updatedFuture.length : firstNonSubIdx;
            updatedFuture.splice(insertIdx, 0, fullPlayer);
        } else {
            updatedFuture.push(fullPlayer);
        }

        finalLogMessage = `Игрок ${displayName} добавлен в лист ожидания (будущую очередь).`;
        isSuccess = true;
        return {...prev, futureQueue: updatedFuture};
    });

    if (isSuccess) {
        pushLog(finalLogMessage, LOG_STATUS.SUCCESS, initiator, actorUsername, rawCommand, extractedNickname);
    } else if (finalLogMessage) {
        pushLog(finalLogMessage, LOG_STATUS.REJECTED, initiator, actorUsername, rawCommand);
    }
};
