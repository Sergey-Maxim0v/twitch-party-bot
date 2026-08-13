import {createContext} from "react";
import type {QueueState, QueuePlayer, QueueSession, QueueLogItem, LogInitiator, LogActorRole} from "../types";

export interface QueueContextValue {
    // === Реактивные состояния (Стейты) ===
    /** Игроки в текущей активной очереди */
    activeQueue: QueuePlayer[];
    /** Игроки в будущих/ожидающих очередях */
    futureQueue: QueuePlayer[];
    /** История завершенных игровых сессий (составов) */
    queueHistory: QueueSession[];
    /** Массив логов действий очереди */
    queueLogs: QueueLogItem[];
    /** Полный сырой объект состояния очереди (для отладки/сохранения) */
    rawState: QueueState;

    // === Методы очистки (Clear) ===
    /** Очистить текущую активную очередь */
    clearActiveQueue: (args: { initiator: LogInitiator; actorUsername: string; actorRole: LogActorRole }) => void;
    /** Очистить будущие очереди */
    clearFutureQueue: (args: { initiator: LogInitiator; actorUsername: string; actorRole: LogActorRole }) => void;
    /** Очистить историю сыгранных сессий */
    clearQueueHistory: (args: { initiator: LogInitiator; actorUsername: string; actorRole: LogActorRole }) => void;
    /** Очистить логи очереди */
    clearQueueLogs: () => void;

    // === Управление игроками (CRUD) ===
    /** Добавить игрока в очередь (в активную или будущую на основе правил) */
    addPlayerToQueue: (args: {
        playerData: Omit<QueuePlayer, "timestamp">;
        initiator: LogInitiator;
        actorUsername: string;
        actorRole: LogActorRole;
        rawCommand?: string;
        customTimestamp?: number;
    }) => void;

    /** Удалить первую найденную запись игрока из конкретной очереди (активной или будущей) */
    removePlayerFromQueue: (args: {
        userId: string;
        targetQueueType: 'active' | 'future';
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
    }) => void;

    /** Полностью удалить игрока из всех существующих очередей (например, при команде !leave) */
    removePlayerFromAllQueues: (args: {
        userId: string;
        initiator: LogInitiator;
        actorUsername: string;
        rawCommand?: string;
    }) => void;

    /** Добавить игрока во внутренний бан-лист очереди и выдворить его из текущих списков */
    banPlayerFromQueue: (args: {
        userId?: string;
        username: string;
        displayedUsername?: string;
        initiator: LogInitiator;
        actorUsername: string;
    }) => void;

    /** Универсальное перемещение игрока внутри списков или между ними (Drag-and-Drop) */
    movePlayer: (args: {
        userId: string;
        targetQueueType: 'active' | 'future';
        targetIndex: number | undefined;
        initiator: LogInitiator;
        actorUsername: string;
    }) => void;

    // === Жизненный цикл очереди ===
    /** Завершить текущую очередь (активная улетает в историю, будущая ротируется) */
    finishActiveQueue: (args: { initiator: LogInitiator; actorUsername: string }) => void;
}

export const QueueContext = createContext<QueueContextValue | undefined>(undefined);
