import {useCallback, useRef, useState} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {MAX_MESSAGES, TwitchIrcCommand} from "../config.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";

/**
 * Единый хук управления состоянием чата Twitch.
 * Инкапсулирует историю сообщений, очистку при JOIN и перехват USERSTATE для эхо-ответов.
 */
export const useTwitchChat = () => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);

    const pendingTextsRef = useRef<string[]>([]);

    const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
        if (message.command === TwitchIrcCommand.JOIN) {
            setMessages([]);
            return;
        }

        const isUserstate = message.command === TwitchIrcCommand.USER_STATE;

        if (!isUserstate && message.command !== TwitchIrcCommand.PRIV_MSG) return;

        setMessages((prev) => {
            let messageToPush = message;

            if (isUserstate) {
                const savedText = pendingTextsRef.current.shift();

                if (!savedText) return prev;

                messageToPush = {
                    ...message,
                    command: TwitchIrcCommand.PRIV_MSG,
                    text: savedText,
                    user: message.tags["display-name"] || "dev_7788"
                };
            }

            const updated = [...prev, messageToPush];

            if (updated.length > MAX_MESSAGES) {
                return updated.slice(updated.length - MAX_MESSAGES);
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
