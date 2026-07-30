import type {MessageCallback} from "../../twitch";

export interface SocketStorage {
    connect: (channel: string, token: string, userLogin: string) => void;
    disconnect: () => void;
    subscribe: (callback: MessageCallback) => (() => void);
    sendMessage: (text: string) => void;
}
