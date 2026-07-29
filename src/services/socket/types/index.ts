export interface SocketStorage {
    get: () => WebSocket | null;
    set: (ws: WebSocket | null) => void;
    connect: (channel: string, token: string) => void;
    disconnect: () => void;
}
