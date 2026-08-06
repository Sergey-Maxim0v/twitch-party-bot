import {useEffect, useRef, type RefObject} from "react";
import {CHAT_ACCESS_STATUSES, CONNECTION_STATUSES} from "../types";
import type {ChatAccessStatus, ConnectionStatus} from "../types";
import type {TwitchIrcClient} from "../../twitch/twitchIrcClient.ts";

interface UseSocketNetworkSyncProps {
    clientRef: RefObject<TwitchIrcClient | null>;
    chatAccessStatus: ChatAccessStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;
    setChatAccessStatus: (status: ChatAccessStatus) => void;
}

/**
 * Хук для отслеживания системного статуса сети браузера (online/offline).
 */
export const useSocketNetworkSync = ({
                                         clientRef,
                                         chatAccessStatus,
                                         setConnectionStatus,
                                         setChatAccessStatus
                                     }: UseSocketNetworkSyncProps): void => {
    const lastActiveChatStatusRef = useRef<ChatAccessStatus>(CHAT_ACCESS_STATUSES.OFFLINE);

    useEffect(() => {
        if (chatAccessStatus !== CHAT_ACCESS_STATUSES.OFFLINE) {
            lastActiveChatStatusRef.current = chatAccessStatus;
        }
    }, [chatAccessStatus]);

    useEffect(() => {
        const handleOffline = (): void => {
            setConnectionStatus(CONNECTION_STATUSES.DISCONNECTED);
            setChatAccessStatus(CHAT_ACCESS_STATUSES.OFFLINE);
        };

        const handleOnline = (): void => {
            const client = clientRef.current;

            if (client && client.readyState === WebSocket.OPEN) {
                setConnectionStatus(CONNECTION_STATUSES.CONNECTED);
                setChatAccessStatus(lastActiveChatStatusRef.current);
                return;
            }

            setConnectionStatus(CONNECTION_STATUSES.CONNECTING);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [clientRef, setConnectionStatus, setChatAccessStatus]);
};
