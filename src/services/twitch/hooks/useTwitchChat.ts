import {useCallback, useEffect, useRef, useState} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {MAX_MESSAGES, TwitchIrcCommand} from "../config.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";
import {useSocketRef} from "../../socket/hooks/useSocketRef.ts";

/**
 * Единый хук управления состоянием чата Twitch.
 */
export const useTwitchChat = () => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);
    const pendingTextsRef = useRef<string[]>([]);
    const socketContext = useSocketRef();

    useEffect(() => {
        const client = socketContext?.getClient?.();

        if (!client || !client.onChannelChange) return;

        client.onChannelChange(() => {
            setMessages([]);
        });
    }, [socketContext]);

    const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
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

    return {
        messages,
        registerPendingMessage
    };
};
