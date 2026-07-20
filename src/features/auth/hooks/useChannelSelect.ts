import {useCallback, useState} from "react";
import {useLocalStorage} from "../../../hooks";
import {TWITCH_STORAGE_KEYS, validateChannelName} from "../../../services/twitch";
import {useAuth} from "./useAuth";

export const useChannelSelect = () => {
    const {session} = useAuth();

    const [activeChannel, setActiveChannel] = useLocalStorage<string | null>(
        TWITCH_STORAGE_KEYS.ACTIVE_CHANNEL,
        null
    );
    const [error, setError] = useState<string | null>(null);

    const selectOwnChannel = useCallback(() => {
        if (!session?.login) {
            setError('Сессия не найдена. Сначала авторизуйтесь.');
            return;
        }
        setError(null);
        setActiveChannel(session.login.toLowerCase());
    }, [session, setActiveChannel]);

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
    }, [setActiveChannel]);

    const resetChannel = useCallback(() => {
        setActiveChannel(null);
        setError(null);
    }, [setActiveChannel]);

    return {
        activeChannel,
        hasSelectedChannel: !!activeChannel,
        channelError: error,
        selectOwnChannel,
        selectCustomChannel,
        resetChannel,
    };
};
