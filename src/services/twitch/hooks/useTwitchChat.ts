import {useState, useCallback} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";
import {MAX_MESSAGES} from "../config.ts";

/**
 * Хук для панели чата.
 * Накапливает сообщения и возвращает массив для рендеринга.
 */
export const useTwitchChat = () => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);

    // Обертываем колбэк в useCallback, чтобы референс не менялся при каждом рендере
    const handleNewMessage = useCallback((message: ParsedIrcMessage) => {
        if (message.command !== "PRIVMSG") return;

        setMessages((prev) => {
            const updated = [...prev, message];

            if (updated.length > MAX_MESSAGES) {
                return updated.slice(updated.length - MAX_MESSAGES);
            }

            return updated;
        });
    }, []);

    // Подписываемся на поток
    useTwitchSubscription(handleNewMessage);

    const clearChat = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        clearChat
    };
};
