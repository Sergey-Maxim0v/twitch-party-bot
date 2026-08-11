import type {QueueState} from "../types";

interface CalculateBanStateOptions {
    userId: string;
    state: QueueState;
}

/**
 * Полностью удаляет игрока изо всех активных и будущих составов
 */
export const calculateBanState = ({userId, state}: CalculateBanStateOptions): QueueState => {
    // 1. Фильтруем текущий состав
    const updatedCurrent = state.currentSession
        ? {
            ...state.currentSession,
            players: state.currentSession.players.filter(p => p.userId !== userId)
        }
        : null;

    // 2. Фильтруем все будущие составы
    const updatedFuture = state.futureSessions.map(session => ({
        ...session,
        players: session.players.filter(p => p.userId !== userId)
    }));

    return {
        ...state,
        currentSession: updatedCurrent,
        futureSessions: updatedFuture
    };
};
