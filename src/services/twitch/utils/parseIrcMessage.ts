import {TwitchIrcCommand, type TwitchIrcCommandType} from "../config.ts";

export interface ParsedIrcMessage {
    id: string;       // Уникальный ID сообщения (msg-id из тегов Twitch)
    user: string;     // Никнейм отправителя
    text: string;     // Текст сообщения
    command: TwitchIrcCommandType;  // Команда (например, 'PRIVMSG', 'JOIN', 'USERSTATE')
    timestamp: string;// Время сообщения HH:MM
    tags: Record<string, string>;
    isSystem: boolean;       // Системное сообщение
    isChannelEvent: boolean; // Событиям канала/модерации
}

/**
 * Парсит сырую строку от Twitch IRC в структурированный объект.
 */
export const parseIrcMessage = (rawMessage: string): ParsedIrcMessage | null => {
    if (!rawMessage) return null;

    let remaining = rawMessage.trim();
    const tags: Record<string, string> = {};

    // 1. Парсим теги, если они есть (начинаются с @)
    if (remaining.startsWith("@")) {
        const spaceIndex = remaining.indexOf(" ");
        if (spaceIndex === -1) return null;

        const tagsPart = remaining.slice(1, spaceIndex);
        remaining = remaining.slice(spaceIndex + 1);

        const pairs = tagsPart.split(";");

        for (const pair of pairs) {
            const [key, value] = pair.split("=");

            if (key) {
                // Декодируем специфичные для Twitch экранированные символы в тегах (например, \s для пробела)
                tags[key] = value ? value.replace(/\\s/g, " ").replace(/\\:/g, ":") : "";
            }
        }
    }

    // 2. Ищем префикс источника (ник пользователя, начинается с ":")
    let user = "";
    if (remaining.startsWith(":")) {
        const spaceIndex = remaining.indexOf(" ");
        if (spaceIndex === -1) return null;

        const prefix = remaining.slice(1, spaceIndex);
        remaining = remaining.slice(spaceIndex + 1);

        // Извлекаем чистый никнейм из формата user!user@user.tmi.twitch.tv
        const exclamationIndex = prefix.indexOf("!");
        user = exclamationIndex !== -1 ? prefix.slice(0, exclamationIndex) : prefix;
    }

    // 3. Выделяем команду и текст сообщения
    const colonIndex = remaining.indexOf(" :");
    let commandPart = remaining;
    let text = "";

    if (colonIndex !== -1) {
        commandPart = remaining.slice(0, colonIndex);
        text = remaining.slice(colonIndex + 2); // Всё, что после " :" — это текст сообщения
    } else {
        // Для команд без текста (например, CLEARCHAT всего чата)
        const parts = remaining.split(" ");
        if (parts.length > 2 && (parts[0] === TwitchIrcCommand.CLEAR_CHAT || parts[0] === TwitchIrcCommand.CLEAR_MSG)) {
            commandPart = parts.slice(0, 2).join(" ");
        }
    }

    const commandParts = commandPart.split(" ");
    const command = (commandParts[0] || "") as TwitchIrcCommandType;

    // Для CLEARCHAT, если текст не выделился через ":", ник забаненного может быть вторым аргументом команды
    if ((command === TwitchIrcCommand.CLEAR_CHAT || command === TwitchIrcCommand.CLEAR_MSG) && !text && commandParts[2]) {
        text = commandParts[2];
    }

    // Генерируем запасной id, если Twitch не прислал его в тегах для этой команды
    const id = tags["id"] || tags["msg-id"] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Извлекаем временную метку Twitch (tmi-sent-ts) или берем текущее время
    const rawTimestamp = tags["tmi-sent-ts"] ? parseInt(tags["tmi-sent-ts"], 10) : Date.now();
    const date = new Date(rawTimestamp);
    const timestamp = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    // Вычисляем флаги на основе прочитанной команды
    const isSystem =
        tags["is-system"] === "1" ||
        command === TwitchIrcCommand.NOTICE ||
        command === TwitchIrcCommand.ROOM_STATE ||
        command === TwitchIrcCommand.USER_NOTICE ||
        command === TwitchIrcCommand.CLEAR_CHAT ||
        command === TwitchIrcCommand.CLEAR_MSG;

    const isChannelEvent = isSystem ||
        command === TwitchIrcCommand.GLOBAL_USER_STATE ||
        command === TwitchIrcCommand.MOTD_START;

    return {id, user, text, command, timestamp, isSystem, isChannelEvent, tags};
};
