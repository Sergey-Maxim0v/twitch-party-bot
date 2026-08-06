import {useCallback, useEffect, useRef, useState} from "react";
import type {TwitchAuthMessageData} from "../types/messages.types.ts";
import {TWITCH_AUTH_ERRORS} from "../config.ts";
import {AUTH_STAGES, type AuthStage} from "../types";
import {getTwitchAuthUrl} from "../utils/getTwitchAuthUrl.ts";

interface UseTwitchPopupProps {
    onSuccess: (token: string) => Promise<void>;
    setError: (err: string | null) => void;
}

/**
 * Хук для управления всплывающим окном (popup) авторизации Twitch.
 */
export const useTwitchPopup = ({onSuccess, setError}: UseTwitchPopupProps) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [authStage, setAuthStage] = useState<AuthStage>(AUTH_STAGES.IDLE);

    const popupRef = useRef<Window | null>(null);

    /**
     * Инициализирует процесс авторизации и открывает всплывающее окно
     */
    const login = useCallback((): void => {
        setError(null);
        setAuthStage(AUTH_STAGES.WAITING);
        setIsModalOpen(true);

        const width = 500;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const url = getTwitchAuthUrl();
        popupRef.current = window.open(
            url,
            "TwitchAuthPopup",
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
    }, [setError]);

    /**
     * Закрывает модальное и всплывающее окна
     */
    const closeModal = useCallback((): void => {
        setIsModalOpen(false);
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
        }
    }, []);

    // Слушатель событий message от всплывающего окна
    useEffect(() => {
        const handleMessage = async (event: MessageEvent): Promise<void> => {
            if (event.origin !== window.location.origin) return;

            const data = event.data as Partial<TwitchAuthMessageData>;
            if (!data || data.type !== "TWITCH_AUTH_RESULT") return;

            if (data.error) {
                setAuthStage(AUTH_STAGES.ERROR);
                setError(
                    data.error === TWITCH_AUTH_ERRORS.CSRF_FAILED
                        ? "Ошибка безопасности (CSRF): верификация контекста не пройдена."
                        : `Авторизация отклонена Twitch: ${data.error}`
                );
                return;
            }

            if (data.token) {
                setAuthStage(AUTH_STAGES.VALIDATING);
                try {
                    // Передаем токен во внешнюю логику сохранения сессии
                    await onSuccess(data.token);

                    // Если сохранение прошло успешно, переводим в статус SUCCESS
                    setAuthStage(AUTH_STAGES.SUCCESS);

                    // Плавно закрываем модальное окно через секунду
                    setTimeout(() => {
                        setIsModalOpen(false);
                    }, 1000);
                } catch (err) {
                    setAuthStage(AUTH_STAGES.ERROR);
                    const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка валидации токена.";
                    setError(errorMessage);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [onSuccess, setError]);

    // Отслеживание ручного закрытия окна пользователем
    useEffect(() => {
        if (!isModalOpen || authStage !== AUTH_STAGES.WAITING) return;

        const timer = setInterval(() => {
            if (popupRef.current && popupRef.current.closed) {
                clearInterval(timer);
                if (authStage === AUTH_STAGES.WAITING) {
                    setAuthStage(AUTH_STAGES.ERROR);
                    setError("Авторизация отменена: всплывающее окно было закрыто.");
                }
            }
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, [isModalOpen, authStage, setError]);

    return {
        isModalOpen,
        setIsModalOpen,
        authStage,
        setAuthStage,
        login,
        closeModal,
    };
};
