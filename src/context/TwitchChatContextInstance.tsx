import {createContext, useContext} from 'react';
import type {ParsedMessage} from "../services/twitch";
import type {TwitchConnectionStatusType, TwitchErrorTypeValues} from "../constants";

export interface TwitchChatContextType {
    messages: ParsedMessage[];
    status: TwitchConnectionStatusType;
    error: TwitchErrorTypeValues | null;
    sendMessage: (text: string) => void;
    isConnected: boolean;
    isConnecting: boolean;
    hasError: boolean;
}

export const TwitchChatContextInstance = createContext<TwitchChatContextType | null>(null);

export const useTwitchChatContext = (): TwitchChatContextType => {
    const context = useContext(TwitchChatContextInstance);
    if (!context) {
        throw new Error('useTwitchChatContext должен использоваться строго внутри TwitchChatProvider');
    }
    return context;
};
