import type {QueueSession} from "../types.ts";

/**
 * Вспомогательная функция для генерации сессий
 */
export const createNewSession = (name: string): QueueSession => ({
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    name,
    createdAt: Date.now(),
    players: []
});
