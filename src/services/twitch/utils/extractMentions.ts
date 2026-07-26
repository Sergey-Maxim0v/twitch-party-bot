import type {ParsedMessage} from "../parseChatMessage.ts";

/**
 * Извлекает все упоминания пользователей (@username) из текста сообщения.
 * Возвращает массив логинов в нижнем регистре без символа @.
 */
export const extractMentions = (text: string): ParsedMessage["mentions"] => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    const mentions: string[] = [];
    const mentionRegex = /@([a-zA-Z0-9_]{4,25})/g;
    let match;

    while ((match = mentionRegex.exec(trimmedText)) !== null) {
        mentions.push(match[1].toLowerCase());
    }

    return mentions;
};
