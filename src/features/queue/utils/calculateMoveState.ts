import type {QueueState, QueuePlayer, QueueSession} from "../types";

interface CalculateMoveOptions {
    userId: string;
    fromSessionId: string;
    toSessionId: string;
    targetIndex?: number;
    state: QueueState;
}

interface CalculateMoveResult {
    nextState: QueueState;
    movedPlayer: QueuePlayer | null;
    fromSessionName: string;
    toSessionName: string;
}

/**
 * Извлекает игрока из одного состава и вставляет его в другой на нужную позицию
 */
export const calculateMoveState = ({
                                       userId,
                                       fromSessionId,
                                       toSessionId,
                                       targetIndex,
                                       state
                                   }: CalculateMoveOptions): CalculateMoveResult => {
    let movedPlayer: QueuePlayer | null = null;
    let fromSessionName = "";
    let toSessionName = "";

    // 1. Собираем плоский список всех сессий (текущая + будущие), чтобы найти нужные
    const allSessions: QueueSession[] = [];
    if (state.currentSession) allSessions.push(state.currentSession);
    allSessions.push(...state.futureSessions);

    // Ищем сессии для логов
    const fromSess = allSessions.find(s => s.id === fromSessionId);
    const toSess = allSessions.find(s => s.id === toSessionId);
    if (fromSess) fromSessionName = fromSess.name;
    if (toSess) toSessionName = toSess.name;

    // 2. Функция извлечения игрока из сессии
    const extractPlayer = (session: QueueSession | null): QueueSession | null => {
        if (!session || session.id !== fromSessionId) return session;
        const found = session.players.find(p => p.userId === userId);
        if (found) movedPlayer = found;
        return {...session, players: session.players.filter(p => p.userId !== userId)};
    };

    // Извлекаем игрока из стейта
    const currentAfterExtract = extractPlayer(state.currentSession);
    const futureAfterExtract = state.futureSessions.map(s => extractPlayer(s)!).filter(Boolean);

    if (!movedPlayer) return {nextState: state, movedPlayer: null, fromSessionName, toSessionName};

    // 3. Функция вставки игрока в целевую сессию
    const injectPlayer = (session: QueueSession | null): QueueSession | null => {
        if (!session || session.id !== toSessionId) return session;
        const updatedPlayers = [...session.players];
        const insertAt = targetIndex !== undefined ? targetIndex : updatedPlayers.length;
        updatedPlayers.splice(insertAt, 0, movedPlayer!);
        return {...session, players: updatedPlayers};
    };

    // Вставляем игрока в стейта
    const finalCurrent = injectPlayer(currentAfterExtract);
    const finalFuture = futureAfterExtract.map(s => injectPlayer(s)!);

    return {
        nextState: {
            ...state,
            currentSession: finalCurrent,
            futureSessions: finalFuture
        },
        movedPlayer,
        fromSessionName,
        toSessionName
    };
};
