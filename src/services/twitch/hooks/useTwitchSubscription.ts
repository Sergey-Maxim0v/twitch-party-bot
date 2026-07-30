import {useEffect} from "react";
import {useSocketRef} from "../../socket/hooks/useSocketRef.ts";
import type {ParsedIrcMessage} from "../utils/parseIrcMessage.ts";

/**
 * Базовый хук для подписки на события Twitch IRC.
 * Автоматически управляет жизненным циклом подписки.
 */
export const useTwitchSubscription = (callback: (message: ParsedIrcMessage) => void) => {
    const socketContext = useSocketRef();

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
