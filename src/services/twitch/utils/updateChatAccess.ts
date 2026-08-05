import type {RefObject} from "react"; // Импортируем утилиту проверки
import {TwitchIrcCommand} from "../config";
import type {ParsedIrcMessage} from "./parseIrcMessage";
import {CHAT_ACCESS_STATUSES, type ChatAccessStatus} from "../../socket/types";
import {checkIsRoomRestricted} from "./checkIsRoomRestricted";

interface UpdateChatAccessProps {
    message: ParsedIrcMessage;
    currentUserLogin?: string;
    pendingTextsRef: { current: string[] };
    timeoutTimerRef: RefObject<ReturnType<typeof setTimeout> | null>;
    updateChatAccessStatus: (status: ChatAccessStatus) => void;
}

/**
 * Анализирует входящие IRC-команды Twitch для динамического переключения
 * статуса доступности чата и очистки застрявших очередей сообщений.
 */
export const updateChatAccess = ({
                                     message,
                                     currentUserLogin,
                                     pendingTextsRef,
                                     timeoutTimerRef,
                                     updateChatAccessStatus
                                 }: UpdateChatAccessProps): void => {
    // 1. Обработка глобальных настроек комнаты
    if (message.command === TwitchIrcCommand.ROOM_STATE) {
        const isRestricted = checkIsRoomRestricted(message);
        updateChatAccessStatus(isRestricted ? CHAT_ACCESS_STATUSES.RESTRICTED : CHAT_ACCESS_STATUSES.CONNECTED);
        return;
    }

    // 2. Персональные блокировки из NOTICE (ошибки отправки при муте)
    if (message.command === TwitchIrcCommand.NOTICE) {
        const msgId = message.tags?.["msg-id"];

        if (msgId === "msg_banned") {
            updateChatAccessStatus("banned");
            pendingTextsRef.current = []; // Очищаем застрявшую очередь сообщений
        } else if (msgId === "msg_subsonly" || msgId === "msg_followersonly" || msgId === "msg_timedout") {
            updateChatAccessStatus(CHAT_ACCESS_STATUSES.RESTRICTED);
            pendingTextsRef.current = []; // Очищаем застрявшую очередь сообщений
        }
        return;
    }

    // 3. Мгновенный перехват мута/бана нашего аккаунта через CLEAR_CHAT
    if (message.command === TwitchIrcCommand.CLEAR_CHAT) {
        const targetUser = message.text?.trim()?.toLowerCase();

        // Если модератор забанил или выдал таймаут именно нашему боту
        if (targetUser && targetUser === currentUserLogin) {
            const durationStr = message.tags?.["ban-duration"];

            if (timeoutTimerRef.current) {
                clearTimeout(timeoutTimerRef.current);
                timeoutTimerRef.current = null;
            }

            if (durationStr) {
                // Это временный мут (таймаут)
                updateChatAccessStatus(CHAT_ACCESS_STATUSES.RESTRICTED);

                const durationSeconds = parseInt(durationStr, 10);

                if (!isNaN(durationSeconds) && durationSeconds > 0) {
                    timeoutTimerRef.current = setTimeout(() => {
                        updateChatAccessStatus(CHAT_ACCESS_STATUSES.CONNECTED);
                        timeoutTimerRef.current = null;
                    }, durationSeconds * 1000);
                }
            } else {
                // Это перманентный бан
                updateChatAccessStatus(CHAT_ACCESS_STATUSES.BANNED);
            }
        }
        return;
    }

    // 4. Перехват успешного USER_STATE (сигнал разбана или успешной отправки)
    if (message.command === TwitchIrcCommand.USER_STATE) {
        if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
        }
        updateChatAccessStatus(CHAT_ACCESS_STATUSES.CONNECTED);
        return;
    }
};
