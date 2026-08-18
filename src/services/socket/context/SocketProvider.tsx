import {type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    CHAT_ACCESS_STATUSES,
    type ChatAccessStatus,
    CONNECTION_STATUSES,
    type ConnectionStatus,
    type SocketStorage
} from "../types.ts";
import {SocketInstance} from "./SocketInstance.ts";
import {TwitchIrcClient} from "../../twitch/twitchIrcClient.ts";
import {useSocketNetworkSync} from "../hooks/useSocketNetworkSync.ts";
import type {MessageCallback} from "../../twitch/utils/createMessageEmitter.ts";

interface SocketProviderProps {
    children: ReactNode;
}

const SocketProvider: FC<SocketProviderProps> = ({children}) => {
    const [client] = useState<TwitchIrcClient>(() => new TwitchIrcClient());
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(CONNECTION_STATUSES.DISCONNECTED);
    const [chatAccessStatus, setChatAccessStatus] = useState<ChatAccessStatus>(CHAT_ACCESS_STATUSES.OFFLINE);

    const lastActiveChatStatusRef = useRef<ChatAccessStatus>(CHAT_ACCESS_STATUSES.OFFLINE);

    useEffect(() => {
        if (chatAccessStatus !== CHAT_ACCESS_STATUSES.OFFLINE) {
            lastActiveChatStatusRef.current = chatAccessStatus;
        }
    }, [chatAccessStatus]);

    // Единая подписка на системные изменения статуса сокета низкого уровня
    useEffect(() => {
        const unsubscribe = client.onStatusChange((status: ConnectionStatus) => {
            setConnectionStatus(status);

            if (status === CONNECTION_STATUSES.DISCONNECTED) {
                setChatAccessStatus(CHAT_ACCESS_STATUSES.OFFLINE);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [client]);

    // Подключаем изолированный модуль синхронизации сети ОС
    useSocketNetworkSync({client, lastActiveChatStatusRef, setConnectionStatus, setChatAccessStatus});

    const connect = useCallback((channel: string, token: string, userLogin: string): void => {
        client.connect(channel, token, userLogin);
    }, [client]);

    const disconnect = useCallback(() => {
        client.disconnect();
    }, [client]);

    const subscribe = useCallback((callback: MessageCallback): (() => void) => {
        return client.subscribe(callback);
    }, [client]);

    const sendMessage = useCallback((text: string): void => {
        client.sendMessage(text);
    }, [client]);

    const getClient = useCallback((): TwitchIrcClient => {
        return client;
    }, [client]);

    const updateChatAccessStatus = useCallback((status: ChatAccessStatus): void => {
        setChatAccessStatus(status);
    }, []);

    const value: SocketStorage = useMemo(() => ({
        connect,
        disconnect,
        subscribe,
        sendMessage,
        getClient,
        connectionStatus,
        chatAccessStatus,
        updateChatAccessStatus
    }), [connect, disconnect, subscribe, sendMessage, getClient, connectionStatus, chatAccessStatus, updateChatAccessStatus]);

    return (
        <SocketInstance.Provider value={value}>
            {children}
        </SocketInstance.Provider>
    );
};

export default SocketProvider;
