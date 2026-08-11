import type {QueueState, LogInitiator, LogStatus} from "../types";
import {calculateCompleteState} from "./calculateCompleteState";

interface HandleCompleteOptions {
    initiator: LogInitiator;
    actorUsername: string;

    state: QueueState;
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string) => void;
}

/**
 * Завершает текущую игровую сессию и логирует сдвиг очереди
 */
export const handleCompleteCurrentSession = ({
                                                 initiator,
                                                 actorUsername,
                                                 state,
                                                 setState,
                                                 pushLog
                                             }: HandleCompleteOptions): void => {
    const nextState = calculateCompleteState({state});

    setState(nextState);

    pushLog("текущий состав успешно завершен, очередь сдвинута вперед", "success", initiator, actorUsername);
};
