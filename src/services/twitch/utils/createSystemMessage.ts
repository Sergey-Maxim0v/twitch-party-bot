import type {ParsedIrcMessage} from "./parseIrcMessage.ts";
import {TwitchIrcCommand} from "../config.ts";

/**
 * Создает структурированное системное сообщение на основе команд модерации Twitch (CLEARCHAT, CLEARMSG).
 * Если команда не является модераторской, возвращает null.
 */
export const createSystemMessage = (message: ParsedIrcMessage): ParsedIrcMessage | null => {
    const {command, text, tags, timestamp} = message;

    // Шаблон для генерации системного объекта
    const buildSystemPayload = (systemText: string): ParsedIrcMessage => ({
        id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        user: "Система",
        text: systemText,
        command,
        timestamp,
        tags: {"is-system": "1"}
    });

    // Полная очистка чата или бан/таймаут пользователя
    if (command === TwitchIrcCommand.CLEAR_CHAT) {
        const bannedUser = text?.trim();

        // Если текста нет — это полная очистка чата
        if (!bannedUser) {
            return buildSystemPayload("Чат был очищен модератором.");
        }

        // Если текст есть — это бан или таймаут
        const duration = tags["ban-duration"];
        const actionText = duration
            ? `Пользователь @${bannedUser} заблокирован на ${duration} сек.`
            : `Пользователь @${bannedUser} забанен навсегда.`;

        return buildSystemPayload(actionText);
    }

    // Удаление одного конкретного сообщения
    if (command === TwitchIrcCommand.CLEAR_MSG) {
        const targetUser = tags["login"] || "Пользователь";
        return buildSystemPayload(`Сообщение от @${targetUser} удалено.`);
    }

    return null;
};
