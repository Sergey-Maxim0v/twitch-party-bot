import {useEffect} from "react";
import {useAuth} from "../../../features/auth";
import {useSocketRef} from "./useSocketRef.ts";

/**
 * Изолированный хук для синхронизации состояния авторизации с WebSocket-соединением.
 */
export const useSocketInit = (): void => {
    const {isAuthenticated, session} = useAuth();
    const {connect, disconnect} = useSocketRef();

    useEffect(() => {
        if (isAuthenticated && session?.accessToken && session?.login) {
            connect(session.login, session.accessToken);
        }

        return () => {
            if (!isAuthenticated) {
                disconnect();
            }
        };
    }, [isAuthenticated, session?.accessToken, session?.login, connect, disconnect]);
};
