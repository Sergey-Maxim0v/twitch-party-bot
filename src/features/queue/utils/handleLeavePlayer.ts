import type {QueueState, LogInitiator, LogStatus} from "../types";
import {calculateLeaveState} from "./calculateLeaveState";

interface HandleLeavePlayerOptions {
    userId: string;
    sessionId: string;
    initiator: LogInitiator;
    actorUsername: string;
    rawCommand?: string;
    state: QueueState;
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string, rawCommand?: string) => void;
}

/**
 * Выполняет полный цикл удаления игрока из очереди и логирования
 */
export const handleLeavePlayer = ({
                                      userId,
                                      sessionId,
                                      initiator,
                                      actorUsername,
                                      rawCommand,
                                      state,
                                      setState,
                                      pushLog
                                  }: HandleLeavePlayerOptions): void => {
    const {nextState, removedPlayerUsername} = calculateLeaveState({userId, sessionId, state});

    if (!removedPlayerUsername) return;

    setState(nextState);

    let logMessage: string;
    
    if (initiator === "chat_user") {
        logMessage = `игрок ${removedPlayerUsername} самостоятельно покинул очередь`;
    } else {
        logMessage = `игрок ${removedPlayerUsername} удален из очереди пользователем`;
    }

    pushLog(logMessage, "info", initiator, actorUsername, rawCommand);
};
