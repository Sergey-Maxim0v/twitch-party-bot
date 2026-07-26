import {type FC, type ReactNode, useContext, useMemo} from "react";
import {useTwitchChat} from "../hooks/useTwitchChat.ts";
import {TwitchChatContextInstance} from "./TwitchChatContextInstance.tsx";
import {AuthContextInstance} from "../features/auth/context/AuthContextInstance.ts";

interface TwitchChatProviderProps {
    children: ReactNode;
}

export const TwitchChatProvider: FC<TwitchChatProviderProps> = ({children}) => {
    const auth = useContext(AuthContextInstance);

    const chat = useTwitchChat(auth?.activeChannel || null, auth?.session?.accessToken);

    const value = useMemo(() => ({
        messages: chat.messages,
        status: chat.status,
        error: chat.error,
        sendMessage: chat.sendMessage,
        isConnected: chat.isConnected,
        isConnecting: chat.isConnecting,
        hasError: chat.hasError
    }), [
        chat.messages,
        chat.status,
        chat.error,
        chat.sendMessage,
        chat.isConnected,
        chat.isConnecting,
        chat.hasError
    ]);

    return (
        <TwitchChatContextInstance.Provider value={value}>
            {children}
        </TwitchChatContextInstance.Provider>
    );
};
