import type {QueueState} from "../types";

interface CalculateClearCurrentOptions {
    state: QueueState;
}

/**
 * Очищает список игроков в текущем составе
 */
export const calculateClearCurrentState = ({state}: CalculateClearCurrentOptions): QueueState => {
    if (!state.currentSession) return state;

    return {
        ...state,
        currentSession: {
            ...state.currentSession,
            players: []
        }
    };
};
