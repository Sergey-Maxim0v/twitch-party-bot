import {useCallback, useEffect, useRef, useState} from "react";
import {getTwitchAuthUrl, TWITCH_AUTH_ERRORS, type TwitchAuthMessageData} from "../../../services/twitch";

export const useTwitchPopup = (onSuccess: (
                                   token: string,
                                   setAuthStage: (stage: 'idle' | 'waiting' | 'validating' | 'success' | 'error') => void,
                                   setIsModalOpen: (open: boolean) => void
                               ) => Promise<void>,
                               setError: (err: string | null) => void
) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [authStage, setAuthStage] = useState<'idle' | 'waiting' | 'validating' | 'success' | 'error'>('idle');

    const popupRef = useRef<Window | null>(null);

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
    }, [setError]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
        }
    }, []);

    // Слушатель событий message от всплывающего окна
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            const data = event.data as Partial<TwitchAuthMessageData>;
            if (!data || data.type !== 'TWITCH_AUTH_RESULT') return;

            if (data.error) {
                setAuthStage('error');
                setError(data.error === TWITCH_AUTH_ERRORS.CSRF_FAILED
                    ? 'Ошибка безопасности (CSRF): верификация контекста не пройдена.'
                    : `Авторизация отклонена Twitch: ${data.error}`
                );
                return;
            }

            if (data.token) {
                setAuthStage('validating');
                await onSuccess(data.token, setAuthStage, setIsModalOpen);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onSuccess, setError]);

    // Отслеживание ручного закрытия окна пользователем
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