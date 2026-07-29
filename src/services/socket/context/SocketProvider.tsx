import {type FC, type ReactNode, useEffect, useMemo, useRef} from "react";
import type {SocketStorage} from "../types";
import {SocketInstance} from "./SocketInstance";

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: FC<SocketProviderProps> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null);

    // Добавляем методы-заглушки для проверки рендеров
    const connect = (channel: string, token: string) => {
        //TODO
        console.log(`[SocketProvider] Вызван connect для канала: ${channel}, токен передан: ${!!token}`);
    };

    const disconnect = () => {
        //TODO
        console.log("[SocketProvider] Вызван disconnect");
    };
 
    // Закрываем сокет, если всё приложение вдруг размонтируется
    useEffect(() => {
        return () => socketRef.current?.close();
    }, []);

    const value: SocketStorage = useMemo(() => ({
        get: () => socketRef.current,
        set: (ws) => {
            socketRef.current = ws;
        },
        connect,
        disconnect
    }), []);

    return (
        <SocketInstance.Provider value={value}>
            {children}
        </SocketInstance.Provider>
    );
};
