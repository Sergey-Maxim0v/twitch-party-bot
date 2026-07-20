import {useCallback, useEffect, useRef, useState} from 'react';
import type {TwitchAuthHookResult, TwitchUserSession} from "../types";
import {useLocalStorage} from "../../../hooks";
import {validateTwitchToken} from "../../../services/twitch/validateTwitchToken.ts";
import {
    extractTwitchToken,
    getTwitchAuthUrl,
    TWITCH_AUTH_ERRORS, TWITCH_STORAGE_KEYS,
    type TwitchAuthMessageData
} from "../../../services/twitch";


const STORAGE_KEY = 'tqp_twitch_session';
const VALIDATION_INTERVAL = 45 * 60 * 1000; // Интервал проверки токена (45 минут)

export const useTwitchAuth = (): TwitchAuthHookResult => {
    const [session, setSession] = useLocalStorage<TwitchUserSession | null>(STORAGE_KEY, null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [authStage, setAuthStage] = useState<'idle' | 'waiting' | 'validating' | 'success' | 'error'>('idle');

    const isProcessingHash = useRef(false);
    const popupRef = useRef<Window | null>(null);

    const validateSession = useCallback(async (token: string): Promise<TwitchUserSession | null> => {
        const userData = await validateTwitchToken(token);
        if (!userData) return null;
        return {
            accessToken: token,
            userId: userData.userId,
            login: userData.login,
        };
    }, []);

    const login = useCallback(() => {
        setError(null);
        setAuthStage('waiting');
        setIsModalOpen(true);

        const width = 500;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const url = getTwitchAuthUrl();
        popupRef.current = window.open(
            url,
            'TwitchAuthPopup',
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
    }, []);

    const logout = useCallback(() => {
        setSession(null);
        setError(null);
        setAuthStage('idle');
        setIsModalOpen(false);
        localStorage.removeItem(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL);
    }, [setSession]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
        }
    }, []);

    // Слушатель событий message от всплывающего окна авторизации Twitch
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const data = event.data as Partial<TwitchAuthMessageData>;
            if (!data || data.type !== 'TWITCH_AUTH_RESULT') return;

            if (data.error) {
                setAuthStage('error');
                if (data.error === TWITCH_AUTH_ERRORS.CSRF_FAILED) {
                    setError('Ошибка безопасности (CSRF): верификация контекста не пройдена.');
                } else {
                    setError(`Авторизация отклонена Twitch: ${data.error}`);
                }
                return;
            }

            if (data.token) {
                setAuthStage('validating');
                const validated = await validateSession(data.token);

                if (validated) {
                    setSession(validated);
                    setAuthStage('success');
                    setTimeout(() => setIsModalOpen(false), 1000);
                } else {
                    setAuthStage('error');
                    setError('Не удалось подтвердить валидность токена через Twitch API.');
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [validateSession, setSession]);

    // Отслеживание закрытия всплывающего окна пользователем вручную
    useEffect(() => {
        if (!isModalOpen || authStage !== 'waiting') return;

        const timer = setInterval(() => {
            if (popupRef.current && popupRef.current.closed) {
                clearInterval(timer);
                if (authStage === 'waiting') {
                    setAuthStage('error');
                    setError('Авторизация отменена: всплывающее окно было закрыто.');
                }
            }
        }, 500);

        return () => clearInterval(timer);
    }, [isModalOpen, authStage]);

    // Инициализация приложения и обработка извлечения токена в контексте Popup
    useEffect(() => {
        const handleAuthInit = async () => {
            if (isProcessingHash.current) return;
            isProcessingHash.current = true;

            setIsLoading(true);

            // Инициирует отправку postMessage и закрывает окно, если контекст является всплывающим окном
            extractTwitchToken();

            // Проверка существующей локальной сессии в главном окне
            if (!window.opener && session?.accessToken) {
                const validated = await validateSession(session.accessToken);
                if (!validated) {
                    logout();
                } else {
                    setSession(validated);
                }
            }

            setIsLoading(false);
        };

        handleAuthInit().catch(() => 'useTwitchAuth / handleAuthInit');
    }, [validateSession, setSession, session?.accessToken, logout]);

    // Периодическая проверка статуса токена в фоновом режиме согласно требованиям Twitch
    useEffect(() => {
        if (!session?.accessToken) return;

        const interval = setInterval(async () => {
            const validated = await validateSession(session.accessToken);
            if (!validated) {
                logout();
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
        isModalOpen,
        authStage,
        closeModal
    };
};