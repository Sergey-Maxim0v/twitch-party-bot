import type {ParsedMessage} from "../parseChatMessage.ts";

/**
 * Извлекает все веб-ссылки (URL) из текста сообщения.
 * Возвращает массив найденных строк-ссылок.
 */
export const extractUrls = (text: string): ParsedMessage["urls"] => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const matches = trimmedText.match(urlRegex);

    return matches ? matches : [];
};
