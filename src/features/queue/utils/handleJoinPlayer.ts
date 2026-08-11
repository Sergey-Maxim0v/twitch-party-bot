import type {QueueState, QueuePlayer, LogInitiator, LogStatus} from "../types";
import type {QueueSettings} from "../../queue-settings/types";
import {checkPlayerJoinRestrictions} from "./checkPlayerJoinRestrictions";
import {calculateJoinState} from "./calculateJoinState";
import {getJoinLogMessage} from "./getJoinLogMessage";

interface HandleJoinPlayerOptions {
    // Входные данные действия
    playerData: Omit<QueuePlayer, "timestamp">;
    initiator: LogInitiator;
    actorUsername: string;
    rawCommand?: string;

    // Текущие зависимости из React-контекстов/хуков
    state: QueueState;
    settings: QueueSettings;

    // Колбэки для обновления стейта
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    updateSettings: (settings: Partial<QueueSettings>) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string, rawCommand?: string, extractedNickname?: string | null) => void;
}

/**
 * Выполняет полный цикл добавления игрока в очередь (Валидация -> Стейт -> Логи)
 */
export const handleJoinPlayer = ({
                                     playerData,
                                     initiator,
                                     actorUsername,
                                     rawCommand,
                                     state,
                                     settings,
                                     setState,
                                     updateSettings,
                                     pushLog
                                 }: HandleJoinPlayerOptions): void => {
    const options = {playerData, state, settings};
    const {gameNickname} = playerData;

    // 1. Блок Валидации
    const restrictionError = checkPlayerJoinRestrictions(options);
    if (restrictionError) {
        pushLog(restrictionError, 'rejected', initiator, actorUsername, rawCommand, gameNickname);
        return;
    }

    // 2. Блок Вычисления нового стейта
    const {nextState, resultType, shouldCloseQueue} = calculateJoinState(options);

    // 3. Блок Применения изменений
    setState(nextState);

    if (shouldCloseQueue) {
        updateSettings({isQueueOpen: false});
    }

    // 4. Блок Логирования результатов
    const logMessage = getJoinLogMessage({resultType, gameNickname});
    const logStatus = resultType === 'queue_full' ? 'rejected' : 'success';

    pushLog(logMessage, logStatus, initiator, actorUsername, rawCommand, gameNickname);
};
