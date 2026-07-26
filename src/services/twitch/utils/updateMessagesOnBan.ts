import type {ParsedMessage} from "../parseChatMessage";
import type {ParsedBanEvent} from "./parseBanEvent.ts";

/**
 * Чистая функция для обновления стейта сообщений при возникновении события бана/очистки чата.
 * Реализует логику полной очистки стэйта сообщений или маркировки сообщений конкретного нарушителя.
 */
export const updateMessagesOnBan = (
    currentMessages: ParsedMessage[],
    banEvent: ParsedBanEvent
): ParsedMessage[] => {
    // 1. Сценарий полной очистки чата модератором
    if (banEvent.wasFullClear) {
        return [];
    }

    // 2. Сценарий бана/таймаута конкретного пользователя
    if (banEvent.targetUsername) {
        const bannedUser = banEvent.targetUsername.toLowerCase();

        return currentMessages.map((msg) =>
            msg.username === bannedUser ? {...msg, isBanned: true} : msg
        );
    }

    return currentMessages;
};
