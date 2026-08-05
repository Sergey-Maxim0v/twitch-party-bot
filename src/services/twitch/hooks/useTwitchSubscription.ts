import {useEffect} from "react";
import {useSocketContext} from "../../socket/hooks/useSocketContext.ts";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";

/**
 * Базовый хук для подписки на события Twitch IRC.
 * Автоматически управляет жизненным циклом подписки.
 */
export const useTwitchSubscription = (callback: (message: ParsedIrcMessage) => void) => {
    const socketContext = useSocketContext();

    useEffect(() => {
        if (!socketContext || !socketContext.subscribe) return;

        // Подписываемся на поток сообщений
        const unsubscribe = socketContext.subscribe(callback);

        // Отписываемся при размонтировании компонента
        return () => {
            unsubscribe();
        };
    }, [socketContext, callback]);
};
