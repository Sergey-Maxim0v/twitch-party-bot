import {useCallback, useEffect, useRef} from "react";

/**
 * Хук для управления очередью отправленных сообщений, ожидающих USER_STATE,
 * и контроля таймеров блокировок (мутов/таймаутов).
 */
export const useTwitchPendingMessages = () => {
    const pendingTextsRef = useRef<string[]>([]);
    const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Автоматическая очистка таймера при размонтировании компонента/хука
    useEffect(() => {
        const timer = timeoutTimerRef.current;

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, []);

    /**
     * Регистрирует текст отправляемого сообщения в очереди ожидания USER_STATE
     */
    const registerPendingMessage = useCallback((text: string): void => {
        pendingTextsRef.current.push(text);
    }, []);

    return {
        pendingTextsRef,
        timeoutTimerRef,
        registerPendingMessage
    };
};
