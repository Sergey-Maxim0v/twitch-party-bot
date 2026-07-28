export interface SocketStorage {
    get: () => WebSocket | null;
    set: (ws: WebSocket | null) => void;
}