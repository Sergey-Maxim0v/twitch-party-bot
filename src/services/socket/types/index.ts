import {type MessageCallback, TwitchIrcClient} from "../../twitch";

export interface SocketStorage {
    connect: (channel: string, token: string, userLogin: string) => void;
    disconnect: () => void;
    subscribe: (callback: MessageCallback) => (() => void);
    sendMessage: (text: string) => void;
    getClient: () => TwitchIrcClient;
    connectionStatus: ConnectionStatus;
    chatAccessStatus: ChatAccessStatus;
}

// Константы для сетевого статуса WebSocket-соединения
export const CONNECTION_STATUSES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
} as const;

// Константы для статуса доступности чата Twitch IRC
export const CHAT_ACCESS_STATUSES = {
    OFFLINE: 'offline',
    CONNECTED: 'connected',
    RESTRICTED: 'restricted',
    BANNED: 'banned',
} as const;

export type ConnectionStatus = typeof CONNECTION_STATUSES[keyof typeof CONNECTION_STATUSES];
export type ChatAccessStatus = typeof CHAT_ACCESS_STATUSES[keyof typeof CHAT_ACCESS_STATUSES];
