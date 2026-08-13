import type {QueueState, LogActorRole} from "../types";
import type {QueueSettings} from "../../queue-settings/types.ts";

interface ValidateQueueEntryArgs {
    userId: string;
    username: string;
    isSubscriber: boolean;
    actorRole: LogActorRole;
    state: QueueState;
    settings: QueueSettings;
}

/**
 * Проверяет игрока на соответствие всем правилам и ограничениям настроек очереди.
 * @returns {string | null} Текст ошибки валидации или null, если проверка пройдена
 */
export const validateQueueEntry = ({
                                       userId,
                                       username,
                                       isSubscriber,
                                       actorRole,
                                       state,
                                       settings
                                   }: ValidateQueueEntryArgs): string | null => {
    // Стример, модераторы и система обходят базовые правила ограничений чата
    const isStaff = actorRole === 'стример' || actorRole === 'модератор' || actorRole === 'система';

    if (isStaff) return null;

    // 1. Проверка: Открыта ли очередь
    if (!settings.isQueueOpen) {
        return "отклонено: очередь закрыта";
    }

    // 2. Проверка: Локальный бан-лист фичи
    const isBanned = settings.banList.some(b => b.toLowerCase() === username.toLowerCase());
    if (isBanned) {
        return "отклонено: пользователь находится в бан-листе очереди";
    }

    // 3. Проверка: Только для подписчиков (subscribersOnly)
    if (settings.subscribersOnly && !isSubscriber) {
        return "отклонено: доступ к очереди только для подписчиков Twitch";
    }

    // 4. Проверка кулдаунов (из playerHistory)
    const playerStats = state.playerHistory[userId];
    if (playerStats) {
        const currentTimestamp = Date.now();

        // А) Временной кулдаун (sessionHistoryCooldown в минутах)
        if (settings.sessionHistoryCooldown > 0) {
            const minutesPassed = (currentTimestamp - playerStats.lastPlayedTimestamp) / 60000;
            if (minutesPassed < settings.sessionHistoryCooldown) {
                const remaining = Math.ceil(settings.sessionHistoryCooldown - minutesPassed);
                return `отклонено: кулдаун времени (осталось ${remaining} мин.)`;
            }
        }

        // Б) Сессионный кулдаун (gamesPlayedCooldown по количеству закрытых очередей)
        if (settings.gamesPlayedCooldown > 0) {
            const sessionsPassed = state.globalSessionCounter - playerStats.lastPlayedSessionNumber;
            if (sessionsPassed < settings.gamesPlayedCooldown) {
                const remaining = settings.gamesPlayedCooldown - sessionsPassed;
                return `отклонено: кулдаун сыгранных игр (пропустите еще сессий: ${remaining})`;
            }
        }
    }

    return null;
};
