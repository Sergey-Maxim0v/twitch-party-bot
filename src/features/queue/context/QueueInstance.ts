import {createContext} from "react";
import type {QueueState, QueuePlayer, LogInitiator} from "../types";

export interface QueueContextValue {
    /** Текущее состояние всей очереди (активный состав, будущие, история, кулдауны) */
    state: QueueState;

    /** Добавить игрока в очередь   */
    joinPlayer: (
        playerData: Omit<QueuePlayer, "timestamp">,
        initiator: LogInitiator,
        actorUsername: string,
        rawCommand?: string
    ) => void;

    /** Удалить игрока из конкретной сессии по его userId    */
    leavePlayer: (userId: string, sessionId: string) => void;

    /** Отправить игрока в бан-лист */
    banPlayer: (userId: string, username: string) => void;

    /** Переместить игрока из одной сессии в другую иливнутри состава   */
    movePlayer: (userId: string, fromSessionId: string, toSessionId: string, targetIndex?: number) => void;

    /** Завершить текущий состав    */
    completeCurrentSession: () => void;

    /** Полностью очистить текущую очередь  */
    clearCurrentSession: () => void;

    /** Полностью сбросить все данные очереди   */
    resetAllQueues: () => void;
}

export const QueueContext = createContext<QueueContextValue | undefined>(undefined);
