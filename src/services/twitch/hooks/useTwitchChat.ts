import {useCallback, useEffect, useRef, useState} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {MAX_MESSAGES, TwitchIrcCommand} from "../config.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";
import {useSocketContext} from "../../socket/hooks/useSocketContext.ts";
import {markDeletedMessages} from "../utils/markDeletedMessages.ts";
import {createSystemMessage} from "../utils/createSystemMessage.ts";
import {useAuth} from "../../../features/auth";
import {updateChatAccess} from "../utils/updateChatAccess.ts";

/**
 * Единый хук управления состоянием чата Twitch.
 */
export const useTwitchChat = () => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);
    const pendingTextsRef = useRef<string[]>([]);
    const socketContext = useSocketContext();
    const {session} = useAuth();
    const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    const currentUserLogin = session?.login?.toLowerCase();

    useEffect(() => {
        const currentTimer = timeoutTimerRef.current;

        return () => {
            if (currentTimer) {
                clearTimeout(currentTimer);
            }
        };
    }, []);

    useEffect(() => {
        const client = socketContext?.getClient?.();

        if (!client || !client.onChannelChange) return;

        client.onChannelChange(() => {
            setMessages([]);
        });
    }, [socketContext]);

    const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
        // Вычисляем права доступа и управляем очередью сообщений
        if (socketContext?.updateChatAccessStatus) {
            updateChatAccess({
                message,
                currentUserLogin,
                pendingTextsRef,
                timeoutTimerRef,
                updateChatAccessStatus: socketContext.updateChatAccessStatus
            });
        }

        // Модераторские сообщения
        const isModAction =
            message.command === TwitchIrcCommand.CLEAR_CHAT ||
            message.command === TwitchIrcCommand.CLEAR_MSG;

        // 2. Системные события канала (подписки/рейды/режимы)
        const isChannelEvent =
            message.command === TwitchIrcCommand.USER_NOTICE ||
            message.command === TwitchIrcCommand.ROOM_STATE;

        if (isModAction || isChannelEvent) {
            setMessages((prev) => {
                // Маркируем старые сообщения флагом удаления (только для модерации)
                const updatedHistory = isModAction
                    ? markDeletedMessages({modMessage: message, currentMessages: prev})
                    : prev;

                // Генерируем новое системное сообщение для вывода в чат
                const systemLog = createSystemMessage(message);

                if (!systemLog) return updatedHistory;

                const finalMessages = [...updatedHistory, systemLog];

                if (finalMessages.length > MAX_MESSAGES) {
                    return finalMessages.slice(finalMessages.length - MAX_MESSAGES);
                }

                return finalMessages;
            });
            return;
        }

        // Обработка стандартных текстовых сообщений
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
                    user: message.tags["display-name"] || ""
                };
            }

            const updated = [...prev, messageToPush];

            if (updated.length > MAX_MESSAGES) {
                return updated.slice(updated.length - MAX_MESSAGES);
            }

            return updated;
        });
    }, [currentUserLogin, socketContext.updateChatAccessStatus]);

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
