import {useCallback, useRef, useState} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {MAX_MESSAGES} from "../config.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";

/**
 * Единый хук управления состоянием чата Twitch.
 * Инкапсулирует историю сообщений, очистку при JOIN и перехват USERSTATE для эхо-ответов.
 */
export const useTwitchChat = () => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);
    // Очередь отправленных сообщений для склейки с приходящим USERSTATE
    const pendingTextsRef = useRef<string[]>([]);

    const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
        // Очищаем чат при смене канала (сигнал JOIN)
        if (message.command === "JOIN") {
            setMessages([]);
            return;
        }

        // Перехватываем USERSTATE на нашу собственную отправку
        if (message.command === "USERSTATE" && pendingTextsRef.current.length > 0) {
            const savedText = pendingTextsRef.current.shift();
            if (savedText) {
                message.command = "PRIVMSG";
                message.text = savedText;
                message.user = message.tags["display-name"] || "dev_7788";
            }
        }

        if (message.command !== "PRIVMSG") return;

        setMessages((prev) => {
            const updated = [...prev, message];
            if (updated.length > MAX_MESSAGES) {
                return updated.slice(0, MAX_MESSAGES);
            }
            return updated;
        });
    }, []);

    // Автоматически подписываемся на сырой IRC-поток
    useTwitchSubscription(handleIncomingMessage);

    /**
     * Регистрирует текст отправляемого сообщения в очереди ожидания USERSTATE
     */
    const registerPendingMessage = useCallback((text: string) => {
        pendingTextsRef.current.push(text);
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        registerPendingMessage,
        clearChat
    };
};
