import {useCallback} from "react";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";
import {useSocketContext} from "../../socket/hooks/useSocketContext.ts";
import {useTwitchPendingMessages} from "./useTwitchPendingMessages.ts";
import {useTwitchChatHistory} from "./useTwitchChatHistory.ts";
import {updateChatAccess} from "../utils/updateChatAccess.ts";
import {useTwitchSubscription} from "./useTwitchSubscription.ts";
import {useAuth} from "../../../features/auth/hooks/useAuth.ts";

/**
 * Единый хук управления состоянием чата Twitch.
 * Выступает диспетчером между историей сообщений и очередью отправки.
 */
export const useTwitchChat = () => {
    const socketContext = useSocketContext();
    const {session} = useAuth();

    const {pendingTextsRef, timeoutTimerRef, registerPendingMessage} = useTwitchPendingMessages();

    const client = socketContext?.getClient?.() ?? null;
    const {messages, handleModerationAndEvents, handleStandardMessage} = useTwitchChatHistory({
        client,
        pendingTextsRef
    });

    const currentUserLogin = session?.login?.toLowerCase();

    /**
     * Главный диспетчер обработки каждого входящего IRC-сообщения
     */
    const handleIncomingMessage = useCallback((message: ParsedIrcMessage) => {
        // 1. Вычисляем права доступа и управляем состоянием блокировок
        if (socketContext?.updateChatAccessStatus) {
            updateChatAccess({
                message,
                currentUserLogin,
                pendingTextsRef,
                timeoutTimerRef,
                updateChatAccessStatus: socketContext.updateChatAccessStatus
            });
        }

        // 2. Обрабатываем модераторские действия и системные логи
        const isEventOrMod = handleModerationAndEvents(message);
        if (isEventOrMod) {
            return;
        }

        // 3. Обрабатываем стандартные и подтвержденные текстовые сообщения
        handleStandardMessage(message);
    }, [currentUserLogin, socketContext.updateChatAccessStatus, handleModerationAndEvents, handleStandardMessage, pendingTextsRef, timeoutTimerRef]);

    // Автоматически подписываемся на сырой IRC-поток
    useTwitchSubscription(handleIncomingMessage);

    return {
        messages,
        registerPendingMessage
    };
};
