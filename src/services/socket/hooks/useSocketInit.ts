import {useEffect} from "react";
import {useSocketContext} from "./useSocketContext.ts";
import {useAuth} from "../../../features/auth/hooks/useAuth.ts";

/**
 * Изолированный хук для синхронизации состояния авторизации с WebSocket-соединением.
 */
export const useSocketInit = (): void => {
    const {isAuthenticated, session, activeChannel} = useAuth();
    const {connect, disconnect} = useSocketContext();

    useEffect(() => {
        if (isAuthenticated && session?.accessToken && activeChannel && session?.login) {
            connect(activeChannel, session.accessToken, session.login);
        }

        return () => {
            disconnect();
        };
    }, [isAuthenticated, session?.accessToken, session?.login, connect, disconnect, activeChannel]);
};
