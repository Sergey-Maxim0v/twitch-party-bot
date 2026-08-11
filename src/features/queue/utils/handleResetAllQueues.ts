import type {QueueState, LogInitiator, LogStatus} from "../types";
import {calculateResetState} from "./calculateResetState";

interface HandleResetQueuesOptions {
    initiator: LogInitiator;
    actorUsername: string;

    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string) => void;
}

/**
 * Полностью сбрасывает все данные очередей и логирует операцию
 */
export const handleResetAllQueues = ({
                                         initiator,
                                         actorUsername,
                                         setState,
                                         pushLog
                                     }: HandleResetQueuesOptions): void => {
    const nextState = calculateResetState();

    // Принудительно ставим чистый стейт
    setState(nextState);

    // Записываем лог, который окажется уже в новом, очищенном массиве
    pushLog("все данные очереди, история и кулдауны были полностью сброшены", "info", initiator, actorUsername);
};
