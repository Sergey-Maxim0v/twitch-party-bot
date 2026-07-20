import {useCallback} from "react";
import {useLocalStorage} from "../../../hooks";
import {TWITCH_STORAGE_KEYS, validateChannelName} from "../../../services/twitch";

export const useTwitchChannelState = (sessionLogin: string | undefined, setError: (err: string | null) => void) => {
    const [activeChannel, setActiveChannel] = useLocalStorage<string | null>(TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL, null);

    const selectOwnChannel = useCallback(() => {
        if (!sessionLogin) {
            setError('Сессия не найдена.');
            return;
        }
        setError(null);
        setActiveChannel(sessionLogin.toLowerCase());
    }, [sessionLogin, setActiveChannel, setError]);

    const selectCustomChannel = useCallback((channelName: string) => {
        const trimmed = channelName.trim().toLowerCase();

        if (!trimmed) {
            setError('Имя канала не может быть пустым.');
            return;
        }

        if (!validateChannelName(trimmed)) {
            setError('Некорректное имя канала Twitch.');
            return;
        }

        setError(null);
        setActiveChannel(trimmed);
    }, [setActiveChannel, setError]);

    const resetChannel = useCallback(() => {
        setActiveChannel(null);
        setError(null);
    }, [setActiveChannel, setError]);

    return {
        activeChannel,
        setActiveChannel,
        hasSelectedChannel: !!activeChannel,
        selectOwnChannel,
        selectCustomChannel,
        resetChannel,
    };
};
