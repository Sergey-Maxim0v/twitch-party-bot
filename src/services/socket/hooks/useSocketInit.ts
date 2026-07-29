import {useEffect} from "react";
import {useAuth} from "../../../features/auth";
import {useSocketRef} from "./useSocketRef.ts";

/**
 * Изолированный хук для синхронизации состояния авторизации с WebSocket-соединением.
 */
export const useSocketInit = (): void => {
    const {isAuthenticated, session, activeChannel} = useAuth();
    const {connect, disconnect} = useSocketRef();

    useEffect(() => {
        if (isAuthenticated && session?.accessToken && activeChannel && session?.login) {
            connect(activeChannel, session.accessToken, session.login);
        }

    }, [isAuthenticated, session?.accessToken, session?.login, connect, disconnect, activeChannel]);

};
