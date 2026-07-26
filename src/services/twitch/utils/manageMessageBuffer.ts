import type {ParsedMessage} from "../parseChatMessage.ts";
import {TWITCH_CHAT_MAX_MESSAGES} from "../config.ts";

/**
 * Добавляет новое сообщение в массив и обрезает его, если превышен максимальный лимит.
 * Защищает приложение от утечек памяти при длительных стримах с активным чатом.
 *
 * @param {ParsedMessage[]} currentMessages - Текущий список сообщений в стейте.
 * @param {ParsedMessage} newMessage - Новое входящее сообщение.
 * @returns {ParsedMessage[]} Новый отфильтрованный массив сообщений.
 */
export const manageMessageBuffer = (
    currentMessages: ParsedMessage[],
    newMessage: ParsedMessage
): ParsedMessage[] => {
    const updatedMessages = [...currentMessages, newMessage];

    // Если размер превысил лимит, убираем старые элементы с начала массива
    if (updatedMessages.length > TWITCH_CHAT_MAX_MESSAGES) {
        return updatedMessages.slice(updatedMessages.length - TWITCH_CHAT_MAX_MESSAGES);
    }

    return updatedMessages;
};
