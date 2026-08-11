import type {QueueState, LogInitiator, LogStatus} from "../types";
import {calculateClearCurrentState} from "./calculateClearCurrentState";

interface HandleClearCurrentOptions {
    initiator: LogInitiator;
    actorUsername: string;

    state: QueueState;
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string) => void;
}

/**
 * Очищает текущую очередь и записывает лог операции
 */
export const handleClearCurrentSession = ({
                                              initiator,
                                              actorUsername,
                                              state,
                                              setState,
                                              pushLog
                                          }: HandleClearCurrentOptions): void => {
    const nextState = calculateClearCurrentState({state});

    setState(nextState);

    pushLog("текущая очередь очищена пользователем", "info", initiator, actorUsername);
};
