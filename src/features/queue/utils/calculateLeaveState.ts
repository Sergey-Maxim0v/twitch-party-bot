import type {QueueState} from "../types";

interface CalculateLeaveStateOptions {
    userId: string;
    sessionId: string;
    state: QueueState;
}

interface CalculateLeaveStateResult {
    nextState: QueueState;
    removedPlayerUsername: string | null;
}

/**
 * Удаляет игрока из конкретной сессии и возвращает новый стейт
 */
export const calculateLeaveState = ({
                                        userId,
                                        sessionId,
                                        state
                                    }: CalculateLeaveStateOptions): CalculateLeaveStateResult => {
    let removedPlayerUsername: string | null = null;

    if (state.currentSession && state.currentSession.id === sessionId) {
        const player = state.currentSession.players.find(p => p.userId === userId);
        if (player) {
            removedPlayerUsername = player.username;
            const updatedPlayers = state.currentSession.players.filter(p => p.userId !== userId);

            return {
                nextState: {
                    ...state,
                    currentSession: {...state.currentSession, players: updatedPlayers}
                },
                removedPlayerUsername
            };
        }
    }

    const updatedFutureSessions = state.futureSessions.map(session => {
        if (session.id !== sessionId) return session;

        const player = session.players.find(p => p.userId === userId);
        if (player) removedPlayerUsername = player.username;

        return {
            ...session,
            players: session.players.filter(p => p.userId !== userId)
        };
    });

    return {
        nextState: {
            ...state,
            futureSessions: updatedFutureSessions
        },
        removedPlayerUsername
    };
};
