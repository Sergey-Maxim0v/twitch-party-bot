import type {QueueState, QueueSession} from "../types";
import {createNewSession} from "./createNewSession.ts";

interface CalculateCompleteOptions {
    state: QueueState;
}

/**
 * Завершает текущий состав, обновляет кулдауны и сдвигает будущие очереди
 */
export const calculateCompleteState = ({state}: CalculateCompleteOptions): QueueState => {
    if (!state.currentSession) return state;

    // 1. Фиксируем время завершения игры для текущего состава
    const completedSession: QueueSession = {
        ...state.currentSession,
        playedAt: Date.now()
    };

    // 2. Записываем новые таймстампы кулдаунов для всех игроков, кто только что сыграл
    const updatedCooldowns = {...state.playerCooldownTimestamps};
    completedSession.players.forEach(player => {
        updatedCooldowns[player.userId] = Date.now();
    });

    // 3. Берем первый состав из будущих или создаем новый пустой, если предзаписи не было
    const hasFuture = state.futureSessions.length > 0;
    const nextSession = hasFuture
        ? {...state.futureSessions[0], name: "Текущий состав"}
        : createNewSession("Текущий состав");

    // 4. Убираем взятый состав из массива будущих сессий
    const nextFutureSessions = hasFuture ? state.futureSessions.slice(1) : [];

    return {
        ...state,
        currentSession: nextSession,
        futureSessions: nextFutureSessions,
        historySessions: [completedSession, ...state.historySessions].slice(0, 50), // Ограничиваем историю 50 составами
        playerCooldownTimestamps: updatedCooldowns
    };
};
