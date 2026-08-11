import type {QueuePlayer, QueueState} from "../types.ts";
import type {QueueSettings} from "../../queue-settings/types.ts";

export interface QueueJoinOptions {
    playerData: Omit<QueuePlayer, "timestamp">;
    state: QueueState;
    settings: QueueSettings;
}

/**
 * Валидатор ограничений на вход игрока
 */
export const checkPlayerJoinRestrictions = ({playerData, state, settings}: QueueJoinOptions): string | null => {
    const {userId, username} = playerData;

    if (!settings.isQueueOpen) return "отклонено, приём заявок закрыт";
    if (settings.banList.includes(username.toLowerCase())) return "отклонено, игрок находится в бан-листе";

    if (settings.maxGamesPerUser) {
        const gamesPlayed = state.historySessions.filter(s => s.players.some(p => p.userId === userId)).length;
        if (gamesPlayed >= settings.maxGamesPerUser) {
            return `отклонено, игрок сыграл максимально разрешенное количество игр (${settings.maxGamesPerUser})`;
        }
    }

    const lastPlayed = state.playerCooldownTimestamps[userId];
    if (lastPlayed && settings.sessionHistoryCooldown > 0) {
        const mins = (Date.now() - lastPlayed) / 1000 / 60;
        if (mins < settings.sessionHistoryCooldown) {
            return `отклонено, кулдаун по времени (осталось ${Math.ceil(settings.sessionHistoryCooldown - mins)} мин)`;
        }
    }

    if (settings.gamesPlayedCooldown > 0 && state.historySessions.length > 0) {
        const recent = state.historySessions.slice(0, settings.gamesPlayedCooldown);
        if (recent.some(s => s.players.some(p => p.userId === userId))) {
            return `отклонено, пропуск сыгравших (кулдаун на ${settings.gamesPlayedCooldown} игр)`;
        }
    }

    return null;
};