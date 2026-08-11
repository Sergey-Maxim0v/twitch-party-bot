import type {QueueState, LogInitiator, LogStatus} from "../types";
import {calculateMoveState} from "./calculateMoveState";

interface HandleMoveOptions {
    userId: string;
    fromSessionId: string;
    toSessionId: string;
    targetIndex?: number;
    initiator: LogInitiator;
    actorUsername: string;

    state: QueueState;
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string) => void;
}

/**
 * Перемещает игрока между составами и фиксирует лог операции
 */
export const handleMovePlayer = ({
                                     userId,
                                     fromSessionId,
                                     toSessionId,
                                     targetIndex,
                                     initiator,
                                     actorUsername,
                                     state,
                                     setState,
                                     pushLog
                                 }: HandleMoveOptions): void => {
    const {nextState, movedPlayer, fromSessionName, toSessionName} = calculateMoveState({
        userId,
        fromSessionId,
        toSessionId,
        targetIndex,
        state
    });

    if (!movedPlayer) return; // Если игрока не нашли в исходной сессии, ничего не делаем

    setState(nextState);

    // Генерируем детальный лог перемещения
    const logMessage = fromSessionId === toSessionId
        ? `позиция игрока ${movedPlayer.username} изменена внутри состава "${fromSessionName}"`
        : `игрок ${movedPlayer.username} перемещен из "${fromSessionName}" в "${toSessionName}"`;

    pushLog(logMessage, "info", initiator, actorUsername);
};
