import type {QueueState, LogInitiator, LogStatus} from "../types";
import type {QueueSettings} from "../../queue-settings/types";
import {calculateBanState} from "./calculateBanState";

interface HandleBanPlayerOptions {
    userId: string;
    username: string;
    initiator: LogInitiator;
    actorUsername: string;

    state: QueueState;
    settings: QueueSettings;
    setState: (value: QueueState | ((val: QueueState) => QueueState)) => void;
    updateSettings: (settings: Partial<QueueSettings>) => void;
    pushLog: (message: string, status: LogStatus, initiator: LogInitiator, actorUsername: string) => void;
}

/**
 * Удаляет забаненного игрока отовсюду, обновляет настройки и фиксирует лог
 */
export const handleBanPlayer = ({
                                    userId,
                                    username,
                                    initiator,
                                    actorUsername,
                                    state,
                                    settings,
                                    setState,
                                    updateSettings,
                                    pushLog
                                }: HandleBanPlayerOptions): void => {
    // 1. Вырезаем игрока из массивов очереди
    const nextState = calculateBanState({userId, state});
    setState(nextState);

    // 2. Добавляем имя в бан-лист настроек (приводим к нижнему регистру для проверок)
    const normalizedUsername = username.toLowerCase();
    if (!settings.banList.includes(normalizedUsername)) {
        updateSettings({
            banList: [...settings.banList, normalizedUsername]
        });
    }

    // 3. Фиксируем лог блокировки
    pushLog(`игрок ${username} заблокирован и удален изо всех очередей`, "rejected", initiator, actorUsername);
};
