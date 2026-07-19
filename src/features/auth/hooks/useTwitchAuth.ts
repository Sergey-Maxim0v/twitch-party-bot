import type {TwitchAuthHookResult, TwitchUserSession} from "../types";
import {useLocalStorage} from "../../../hooks";
import {useCallback, useEffect, useRef, useState} from "react";
import {validateTwitchToken} from "../../../services/twitch/validateTwitchToken.ts";
import {extractTwitchToken, getTwitchAuthUrl} from "../../../services/twitch";

const STORAGE_KEY = 'tqp_twitch_session';
const VALIDATION_INTERVAL = 45 * 60 * 1000; // 45 минут

export const useTwitchAuth = (): TwitchAuthHookResult => {
    const [session, setSession] = useLocalStorage<TwitchUserSession | null>(STORAGE_KEY, null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const isProcessingHash = useRef(false);

    const login = useCallback(() => {
        window.location.href = getTwitchAuthUrl();
    }, []);

    const logout = useCallback(() => {
        setSession(null);
        setError(null);
    }, [setSession]);

    const validateSession = useCallback(async (token: string): Promise<TwitchUserSession | null> => {
        const userData = await validateTwitchToken(token);

        if (!userData) {
            return null;
        }

        return {
            accessToken: token,
            userId: userData.userId,
            login: userData.login,
        };
    }, []);

    useEffect(() => {
        const handleAuthInit = async () => {
            if (isProcessingHash.current) return;
            isProcessingHash.current = true;

            setIsLoading(true);

            const hashData = extractTwitchToken();

            // Case 1: Обработка ошибки валидации CSRF state, которую вернул ваш сервис
            if (hashData.error === 'CSRF_VALIDATION_FAILED') {
                setError('Атака CSRF? Несовпадение проверочного контекста (state).');
                setSession(null);
                setIsLoading(false);
                return;
            }

            // Case 2: Успешно вернулись от Twitch с токеном
            if (hashData.token) {
                const validated = await validateSession(hashData.token);
                if (validated) {
                    setSession(validated);
                    setError(null);
                } else {
                    setError('Не удалось верифицировать полученный токен Twitch.');
                    setSession(null);
                }
                setIsLoading(false);
                return;
            }

            // Case 3: Токена в URL нет, проверяем существующую сессию в LocalStorage
            if (session?.accessToken) {
                const validated = await validateSession(session.accessToken);
                if (!validated) {
                    logout();
                    setError('Сессия Twitch истекла. Пожалуйста, войдите снова.');
                } else {
                    setSession(validated);
                }
                setIsLoading(false);
                return;
            }

            // Case 4: Чистый первый заход
            setIsLoading(false);
        };

        handleAuthInit().catch(() => 'useTwitchAuth / handleAuthInit');
    }, [validateSession, setSession, session?.accessToken, logout]);

    // Фоновая проверка токена
    useEffect(() => {
        if (!session?.accessToken) return;

        const interval = setInterval(async () => {
            const validated = await validateSession(session.accessToken);
            if (!validated) {
                logout();
                setError('Сессия Twitch завершена в фоновом режиме.');
            }
        }, VALIDATION_INTERVAL);

        return () => clearInterval(interval);
    }, [session?.accessToken, validateSession, logout]);

    return {
        session,
        isAuthenticated: !!session,
        isLoading,
        error,
        login,
        logout,
    };
};
