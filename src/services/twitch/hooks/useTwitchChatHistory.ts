import {type RefObject, useCallback, useEffect, useState} from "react";
import type {TwitchIrcClient} from "../twitchIrcClient.ts";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {MAX_MESSAGES, TwitchIrcCommand} from "../config.ts";
import {markDeletedMessages} from "../utils/markDeletedMessages.ts";
import {createSystemMessage} from "../utils/createSystemMessage.ts";

interface UseTwitchChatHistoryProps {
    client: TwitchIrcClient | null;
    pendingTextsRef: RefObject<string[]>;
}

/**
 * Хук для управления историей сообщений чата Twitch и модерацией.
 */
export const useTwitchChatHistory = ({client, pendingTextsRef}: UseTwitchChatHistoryProps) => {
    const [messages, setMessages] = useState<ParsedIrcMessage[]>([]);

    // Очистка чата при смене канала
    useEffect(() => {
        if (!client || !client.onChannelChange) return;

        client.onChannelChange(() => {
            setMessages([]);
        });
    }, [client]);

    /**
     * Обрабатывает модераторские действия (удаление сообщений, баны) и системные логи
     */
    const handleModerationAndEvents = useCallback((message: ParsedIrcMessage): boolean => {
        const isModAction =
            message.command === TwitchIrcCommand.CLEAR_CHAT ||
            message.command === TwitchIrcCommand.CLEAR_MSG;

        const isChannelEvent =
            message.command === TwitchIrcCommand.USER_NOTICE ||
            message.command === TwitchIrcCommand.ROOM_STATE;

        if (!isModAction && !isChannelEvent) {
            return false;
        }

        setMessages((prev) => {
            const updatedHistory = isModAction
                ? markDeletedMessages({modMessage: message, currentMessages: prev})
                : prev;

            const systemLog = createSystemMessage(message);

            if (!systemLog) return updatedHistory;

            const finalMessages = [...updatedHistory, systemLog];

            if (finalMessages.length > MAX_MESSAGES) {
                return finalMessages.slice(finalMessages.length - MAX_MESSAGES);
            }

            return finalMessages;
        });

        return true;
    }, []);

    /**
     * Добавляет стандартные текстовые сообщения в общую историю чата
     */
    const handleStandardMessage = useCallback((message: ParsedIrcMessage): void => {
        const isUserstate = message.command === TwitchIrcCommand.USER_STATE;

        if (!isUserstate && message.command !== TwitchIrcCommand.PRIV_MSG) return;

        setMessages((prev) => {
            let messageToPush = message;

            if (isUserstate) {
                const pendingTexts = pendingTextsRef.current;
                const savedText = pendingTexts ? pendingTexts.shift() : null;

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
    }, [pendingTextsRef]);

    return {
        messages,
        handleModerationAndEvents,
        handleStandardMessage
    };
};
