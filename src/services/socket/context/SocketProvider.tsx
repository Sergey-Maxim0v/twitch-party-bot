import {type FC, type ReactNode, useMemo, useRef} from "react";
import {type MessageCallback, TwitchIrcClient} from "../../twitch";
import {SocketInstance} from "./SocketInstance";
import type {SocketStorage} from "../types";

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({children}) => {
    const clientRef = useRef<TwitchIrcClient>(new TwitchIrcClient());

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

    const value: SocketStorage = useMemo(() => ({
        connect,
        disconnect,
        subscribe,
        sendMessage
    }), []);

    return (
        <SocketInstance.Provider value={value}>
            {children}
        </SocketInstance.Provider>
    );
};
