import {useState, useEffect, useCallback, useRef} from "react";
import {AUTH_STAGES, type TwitchAuthHookResult, type TwitchUserSession} from "../types";
import {useTwitchPopup} from "./useTwitchPopup.ts";
import {useTwitchChannelState} from "./useTwitchChannelState.ts";
import {TWITCH_STORAGE_KEYS} from "../config.ts";
import {useChannelProfile} from "./useChannelProfile.ts";
import {useLocalStorage} from "../../../hooks/useLocalStorage.ts";
import {validateTwitchToken} from "../utils/validateTwitchToken.ts";
import {extractTwitchToken} from "../utils/extractTwitchToken.ts";

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

    // Логика обработки успешного получения токена из попапа
    const handlePopupSuccess = useCallback(async (token: string): Promise<void> => {
        const userData = await validateTwitchToken(token);

        if (!userData) {
            throw new Error("Не удалось подтвердить валидность токена через Twitch API.");
        }

        setSession({
            accessToken: token,
            userId: userData.userId,
            login: userData.login,
        });
    }, [setSession]);

    const popupManager = useTwitchPopup({
        onSuccess: handlePopupSuccess,
        setError
    });

    const channelManager = useTwitchChannelState(session?.login);

    const {displayName: activeChannelDisplayName, avatarUrl: activeChannelAvatar} = useChannelProfile({
        channel: channelManager.activeChannel,
        accessToken: session?.accessToken
    });

    const {
        displayName: userDisplayName,
        avatarUrl: userAvatar
    } = useChannelProfile({
        channel: session?.login ?? null,
        accessToken: session?.accessToken
    });

    // Синхронный полный сброс стейтов при разлогине
    const logout = useCallback((): void => {
        setSession(null);
        setError(null);
        popupManager.setAuthStage(AUTH_STAGES.IDLE);
        popupManager.setIsModalOpen(false);
    }, [setSession, popupManager]);

    // Инициализация приложения
    useEffect(() => {
        const handleAuthInit = async (): Promise<void> => {
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

        handleAuthInit().catch((err) => {
            console.error("useTwitchAuth / handleAuthInit error:", err);
        });
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

        return () => {
            clearInterval(interval);
        };
    }, [session?.accessToken, validateSession, logout]);

    return {
        session,
        isAuthenticated: !!session,
        isLoading,
        error,
        channelError: channelManager.channelError,
        logout,
        login: popupManager.login,
        isModalOpen: popupManager.isModalOpen,
        authStage: popupManager.authStage,
        closeModal: popupManager.closeModal,
        activeChannel: channelManager.activeChannel,
        hasSelectedChannel: channelManager.hasSelectedChannel,
        activeChannelDisplayName,
        activeChannelAvatar,
        userDisplayName,
        userAvatar,
        isChannelModalOpen: channelManager.isChannelModalOpen,
        openChannelModal: channelManager.openChannelModal,
        closeChannelModal: channelManager.closeChannelModal,
        selectOwnChannel: channelManager.selectOwnChannel,
        selectCustomChannel: channelManager.selectCustomChannel,
        resetChannel: channelManager.resetChannel,
    };
};
