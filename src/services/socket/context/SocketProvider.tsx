import {type FC, type ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {type MessageCallback, TwitchIrcClient} from "../../twitch";
import {SocketInstance} from "./SocketInstance";
import {
    CHAT_ACCESS_STATUSES,
    type ChatAccessStatus,
    CONNECTION_STATUSES,
    type ConnectionStatus,
    type SocketStorage
} from "../types";
import {useSocketNetworkSync} from "./useSocketNetworkSync.ts";

interface SocketProviderProps {
    children: ReactNode;
}

const SocketProvider: FC<SocketProviderProps> = ({children}) => {
    const clientRef = useRef<TwitchIrcClient>(new TwitchIrcClient());
    // Хранение реактивного статуса сетевого соединения
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(CONNECTION_STATUSES.DISCONNECTED);

    // Хранение реактивного статуса доступности чата
    const [chatAccessStatus, setChatAccessStatus] = useState<ChatAccessStatus>(CHAT_ACCESS_STATUSES.OFFLINE);

    // Синхронизации системного статуса сети
    useSocketNetworkSync({
        clientRef,
        chatAccessStatus,
        setConnectionStatus,
        setChatAccessStatus
    });

    // Подписка на низкоуровневые изменения статуса сокета
    useEffect(() => {
        const client = clientRef.current;

        client.onStatusChange((status) => {
            setConnectionStatus(status);

            // Если сеть отключилась, статус чата автоматически переводим в оффлайн
            if (status === CONNECTION_STATUSES.DISCONNECTED) {
                setChatAccessStatus(CHAT_ACCESS_STATUSES.OFFLINE);
            }
        });
    }, []);

    const connect = (channel: string, token: string, userLogin: string) => {
        clientRef.current.connect(channel, token, userLogin);
    };

    const disconnect = () => {
        clientRef.current.disconnect();
    };

    const subscribe = (callback: MessageCallback) => {
        return clientRef.current.subscribe(callback);
    };
    const sendMessage = (text: string) => {
        clientRef.current.sendMessage(text);
    };

    const getClient = (): TwitchIrcClient => {
        return clientRef.current;
    };

    const updateChatAccessStatus = (status: ChatAccessStatus) => {
        setChatAccessStatus(status);
    };

    const value: SocketStorage = useMemo(() => ({
        connect,
        disconnect,
        subscribe,
        sendMessage,
        getClient,
        connectionStatus,
        chatAccessStatus,
        updateChatAccessStatus
    }), [connectionStatus, chatAccessStatus]);

    return (
        <SocketInstance.Provider value={value}>
            {children}
        </SocketInstance.Provider>
    );
};

export default SocketProvider;
