import {useEffect, useRef} from "react";
import {useSocketContext} from "../../../services/socket/hooks/useSocketContext.ts";
import {useAppLogs} from "./useAppLogs.ts";
import {APP_LOG_STATUSES, type AppLogStatus} from "../types.ts";
import {CONNECTION_STATUSES, CHAT_ACCESS_STATUSES} from "../../../services/socket/types.ts";
import {LOG_INITIATOR, LOG_ACTOR_ROLE} from "../../queue/types.ts";
import {useAuth} from "../../auth/hooks/useAuth.ts";

/**
 * Изолированный хук-наблюдатель для автоматического логирования
 * глобальных системных событий (авторизация, сеть, права чата).
 */
export const useAppLogsObserver = (): void => {
    const {connectionStatus, chatAccessStatus, getClient} = useSocketContext();
    const {session} = useAuth();
    const {pushLog} = useAppLogs();

    const lastStatusRef = useRef(connectionStatus);
    const lastChatAccessRef = useRef(chatAccessStatus);
    const lastUserRef = useRef<string | null>(null);

    // 1. Логирование авторизации аккаунта
    useEffect(() => {
        if (session?.login && session.login !== lastUserRef.current) {
            lastUserRef.current = session.login;
            pushLog({
                message: `Вы вошли в аккаунт: ${session.login}`,
                status: APP_LOG_STATUSES.WARNING,
                initiator: LOG_INITIATOR.STREAMER_UI,
                actorUsername: LOG_ACTOR_ROLE.SYSTEM
            });
        }
    }, [session, pushLog]);

    // 2. Логирование состояний сетевого соединения и попыток переподключения
    useEffect(() => {
        if (connectionStatus === lastStatusRef.current) return;
        lastStatusRef.current = connectionStatus;

        const client = getClient();
        const channel = client?.currentChannel;
        const targetChannel = channel ? `@${channel}` : "Twitch";

        let message = "";
        let status: AppLogStatus = APP_LOG_STATUSES.SUCCESS;

        if (connectionStatus === CONNECTION_STATUSES.CONNECTING) {
            const currentAttempts = client?.reconnectAttempts ?? 0;
            message = currentAttempts > 0
                ? `Повторная попытка подключения к каналу ${targetChannel} (№${currentAttempts})...`
                : `Подключение к каналу ${targetChannel}...`;
        } else if (connectionStatus === CONNECTION_STATUSES.CONNECTED) {
            message = `Подключение к каналу ${targetChannel} установлено.`;
            status = APP_LOG_STATUSES.SUCCESS;
        } else if (connectionStatus === CONNECTION_STATUSES.DISCONNECTED) {
            const isIntentionally = client?.isIntentionallyDisconnected ?? false;
            if (isIntentionally) {
                message = `Соединение с каналом ${targetChannel} закрыто пользователем.`;
                status = APP_LOG_STATUSES.WARNING;
            } else {
                message = "Соединение с Twitch потеряно. Запуск автоматического восстановления...";
                status = APP_LOG_STATUSES.WARNING;
            }
        }

        if (message) {
            pushLog({
                message,
                status,
                initiator: LOG_INITIATOR.STREAMER_UI,
                actorUsername: LOG_ACTOR_ROLE.SYSTEM
            });
        }
    }, [connectionStatus, pushLog, getClient]);

    // 3. Логирование доступности чата и правил комнаты (Room State)
    useEffect(() => {
        if (chatAccessStatus === lastChatAccessRef.current) return;
        lastChatAccessRef.current = chatAccessStatus;

        const channel = getClient()?.currentChannel || "";

        const targetChannel = channel ? `@${channel}` : "";

        let message = "";
        let status: AppLogStatus = APP_LOG_STATUSES.INFO;

        if (chatAccessStatus === CHAT_ACCESS_STATUSES.CONNECTED) {
            message = `Чат канала ${targetChannel} подключен: бот может читать чат и отправлять сообщения.`;
            status = APP_LOG_STATUSES.SUCCESS;
        } else if (chatAccessStatus === CHAT_ACCESS_STATUSES.RESTRICTED) {
            message = `Доступ к чату ${targetChannel} ограничен: бот может читать чат, отправка сообщений ограничена.`;
            status = APP_LOG_STATUSES.SUCCESS;
        } else if (chatAccessStatus === CHAT_ACCESS_STATUSES.BANNED) {
            message = `Доступ к чату ${targetChannel} заблокирован: аккаунт бота забанен на канале.`;
            status = APP_LOG_STATUSES.WARNING;
        }

        if (message) {
            pushLog({
                message,
                status,
                initiator: LOG_INITIATOR.STREAMER_UI,
                actorUsername: LOG_ACTOR_ROLE.SYSTEM
            });
        }
    }, [chatAccessStatus, getClient, pushLog]);
};
