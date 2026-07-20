import {useState, useEffect, useCallback, useRef} from 'react';
import type {TwitchAuthHookResult, TwitchUserSession} from "../types";
import {useLocalStorage} from "../../../hooks";
import {extractTwitchToken, TWITCH_STORAGE_KEYS} from "../../../services/twitch";
import {validateTwitchToken} from "../../../services/twitch/validateTwitchToken.ts";
import {useTwitchPopup} from "./useTwitchPopup.ts";
import {useTwitchChannelState} from "./useTwitchChannelState.ts";


const VALIDATION_INTERVAL = 45 * 60 * 1000;

export const useTwitchAuth = (): TwitchAuthHookResult => {
    const [session, setSession] = useLocalStorage<TwitchUserSession | null>(TWITCH_STORAGE_KEYS.SESSION, null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const isProcessingHash = useRef(false);

    const validateSession = useCallback(async (token: string): Promise<TwitchUserSession | null> => {
        const userData = await validateTwitchToken(token);
        if (!userData) return null;
        return {
            accessToken: token,
            userId: userData.userId,
            login: userData.login,
        };
    }, []);

    const handlePopupSuccess = useCallback(async (
        token: string,
        setAuthStage: (stage: 'idle' | 'waiting' | 'validating' | 'success' | 'error') => void,
        setIsModalOpen: (open: boolean) => void
    ): Promise<void> => {
        const userData = await validateTwitchToken(token);

        if (userData) {
            setSession({
                accessToken: token,
                userId: userData.userId,
                login: userData.login,
            });
            setAuthStage('success');
            setTimeout(() => setIsModalOpen(false), 1000);
        } else {
            setAuthStage('error');
            setError('Не удалось подтвердить валидность токена через Twitch API.');
        }
    }, [setSession]);

    // Подключаем изолированные суб-хуки
    const popupManager = useTwitchPopup(handlePopupSuccess, setError);
    const channelManager = useTwitchChannelState(session?.login, setError);

    // Синхронный полный сброс стейтов при разлогине
    const logout = useCallback(() => {
        setSession(null);
        channelManager.setActiveChannel(null);
        setError(null);
        popupManager.setAuthStage('idle');
        popupManager.setIsModalOpen(false);
    }, [setSession, channelManager, popupManager]);

    // Инициализация приложения
    useEffect(() => {
        const handleAuthInit = async () => {
            if (isProcessingHash.current) return;
            isProcessingHash.current = true;

            setIsLoading(true);
            extractTwitchToken();

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

    // Фоновая проверка токена
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
        logout,
        login: popupManager.login,
        isModalOpen: popupManager.isModalOpen,
        authStage: popupManager.authStage,
        closeModal: popupManager.closeModal,
        activeChannel: channelManager.activeChannel,
        hasSelectedChannel: channelManager.hasSelectedChannel,
        selectOwnChannel: channelManager.selectOwnChannel,
        selectCustomChannel: channelManager.selectCustomChannel,
        resetChannel: channelManager.resetChannel,
    };
};
