import type {ParsedIrcMessage} from "./parseIrcMessage.ts";
import {TwitchIrcCommand} from "../config.ts";

/**
 * Создает структурированное системное сообщение на основе служебных команд Twitch.
 * Если команда не является системной, возвращает null.
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

    // Подписки, рейды, подарки и важные события канала
    if (command === TwitchIrcCommand.USER_NOTICE) {
        const msgId = tags["msg-id"];
        const login = tags["display-name"] || tags["login"] || "Пользователь";

        if (msgId === "sub" || msgId === "resub") {
            const months = tags["msg-param-cumulative-months"] || "1";
            return buildSystemPayload(`@${login} оформляет подписку! Всего месяцев: ${months}.`);
        }

        if (msgId === "subgift" || msgId === "anonsubgift") {
            const recipient = tags["msg-param-recipient-display-name"] || tags["msg-param-recipient-user-name"] || "зрителю";
            return buildSystemPayload(`@${login} дарит подписку пользователю @${recipient}!`);
        }

        if (msgId === "raid") {
            const viewerCount = tags["msg-param-viewerCount"] || "0";
            return buildSystemPayload(`Канал @${login} устраивает рейд и приводит ${viewerCount} зрителей!`);
        }

        // Объявление (анонс) от стримера или модератора
        if (msgId === "announcement") {
            return {
                id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                user: "Объявление",
                text: `@${login}: ${text}`,
                command,
                timestamp,
                tags: {"is-system": "1", "system-type": "announcement"}
            };
        }

        if (text) {
            return buildSystemPayload(`Уведомление от @${login}: ${text}`);
        }
    }

    // Глобальные изменения режимов комнаты (ROOMSTATE)
    if (command === TwitchIrcCommand.ROOM_STATE) {
        // Если это стартовый пакет инициализации комнаты — полностью игнорируем его
        const hasAllTags = tags["subs-only"] !== undefined && tags["slow"] !== undefined && tags["emote-only"] !== undefined;

        if (hasAllTags) {
            return null;
        }

        //
        if (tags["subs-only"] === "1") return buildSystemPayload("Включен режим 'Только для подписчиков'.");
        if (tags["subs-only"] === "0") return buildSystemPayload("Режим 'Только для подписчиков' отключен.");

        if (tags["emote-only"] === "1") return buildSystemPayload("Включен режим 'Только смайлы'.");
        if (tags["emote-only"] === "0") return buildSystemPayload("Режим 'Только смайлы' отключен.");

        if (tags["slow"] && tags["slow"] !== "0") return buildSystemPayload(`Включен медленный режим (${tags["slow"]} сек.).`);
        if (tags["slow"] === "0") return buildSystemPayload("Медленный режим отключен.");
    }

    return null;
};
