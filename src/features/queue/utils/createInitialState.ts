import type {QueueState} from "../types";

/**
 * Генерирует дефолтное пустое состояние для очереди игроков и логов сессий.
 * Используется для ленивой инициализации стейта в localStorage.
 *
 * @returns {QueueState} Начальное состояние очереди
 */
export const createInitialState = (): QueueState => {
    return {
        activeQueue: [],
        futureQueue: [],
        queueHistory: [],
        globalSessionCounter: 0,
        playerHistory: {},
        queueLogs: []
    };
};
