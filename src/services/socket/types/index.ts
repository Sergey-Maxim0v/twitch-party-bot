import {type MessageCallback, TwitchIrcClient} from "../../twitch";

export interface SocketStorage {
    connect: (channel: string, token: string, userLogin: string) => void;
    disconnect: () => void;
    subscribe: (callback: MessageCallback) => (() => void);
    sendMessage: (text: string) => void;
    getClient: () => TwitchIrcClient;
}
