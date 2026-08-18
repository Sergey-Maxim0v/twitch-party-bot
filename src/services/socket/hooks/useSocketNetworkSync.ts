import {useEffect, useRef, type RefObject} from "react";
import {CHAT_ACCESS_STATUSES, CONNECTION_STATUSES} from "../types.ts";
import type {ChatAccessStatus, ConnectionStatus} from "../types.ts";
import type {TwitchIrcClient} from "../../twitch/twitchIrcClient.ts";

interface UseSocketNetworkSyncProps {
    client: TwitchIrcClient;
    lastActiveChatStatusRef: RefObject<ChatAccessStatus>;
    setConnectionStatus: (status: ConnectionStatus) => void;
    setChatAccessStatus: (status: ChatAccessStatus) => void;
}

/**
 * Изолированный хук для контроля сетевого статуса ОС (online/offline).
 */
export const useSocketNetworkSync = ({
                                         client,
                                         lastActiveChatStatusRef,
                                         setConnectionStatus,
                                         setChatAccessStatus
                                     }: UseSocketNetworkSyncProps): void => {
    const setConnectionStatusRef = useRef(setConnectionStatus);
    const setChatAccessStatusRef = useRef(setChatAccessStatus);

    useEffect(() => {
        setConnectionStatusRef.current = setConnectionStatus;
        setChatAccessStatusRef.current = setChatAccessStatus;
    }, [setConnectionStatus, setChatAccessStatus]);

    useEffect(() => {
        const handleOffline = (): void => {
            setConnectionStatusRef.current(CONNECTION_STATUSES.DISCONNECTED);
            setChatAccessStatusRef.current(CHAT_ACCESS_STATUSES.OFFLINE);
        };

        const handleOnline = (): void => {
            if (client.readyState === WebSocket.OPEN) {
                setConnectionStatusRef.current(CONNECTION_STATUSES.CONNECTED);
                setChatAccessStatusRef.current(lastActiveChatStatusRef.current);
                return;
            }

            if (client.readyState === WebSocket.CONNECTING) {
                return;
            }

            client.forceCloseAndReconnect();
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, [client, lastActiveChatStatusRef]);
};
