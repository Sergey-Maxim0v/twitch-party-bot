import {useEffect, useRef, useState} from "react";
import {manageMessageBuffer, type ParsedMessage, TwitchIrcClient, updateMessagesOnBan} from "../services/twitch";
import {TwitchConnectionStatus, type TwitchConnectionStatusType, type TwitchErrorTypeValues} from "../constants";

/**
 * Кастомный React-хук для управления подключением к Twitch-чату,
 * буферизацией сообщений и обработкой событий блокировок пользователей.
 *
 * @param {string | null} channelName - Имя активного канала из useTwitchAuth.
 * @param {string | null | undefined} token - Access OAuth токен сессии из useTwitchAuth.
 */
export const useTwitchChat = (channelName: string | null, token: string | null | undefined) => {
    const [messages, setMessages] = useState<ParsedMessage[]>([]);
    const [status, setStatus] = useState<TwitchConnectionStatusType>(TwitchConnectionStatus.DISCONNECTED);
    const [error, setError] = useState<TwitchErrorTypeValues | null>(null);

    // Храним ссылку на экземпляр класса, чтобы избежать его пересоздания при рендерах
    const clientRef = useRef<TwitchIrcClient | null>(null);

    useEffect(() => {
        // Если данных для подключения нет — ничего не инициализируем
        if (!channelName || !token) return;

        const client = new TwitchIrcClient(channelName, token);
        clientRef.current = client;

        // Очищаем старые ошибки
        setTimeout(() => setError(null), 0);

        client.onStatusChange((newStatus) => {
            setStatus(newStatus);
        });

        client.onError((errType) => {
            setError(errType);
        });

        client.onMessage((newMessage) => {
            setMessages((prevMessages) => manageMessageBuffer(prevMessages, newMessage));
        });

        client.onBanEvent((banEvent) => {
            setMessages((prevMessages) => updateMessagesOnBan(prevMessages, banEvent));
        });

        client.connect();

        // Функция очистки (Cleanup)
        return () => {
            client.disconnect();
            if (clientRef.current === client) {
                clientRef.current = null;
            }
            // Асинхронный сброс всех стейтов при смене канала или разлогине
            setTimeout(() => {
                setMessages([]);
                setStatus(TwitchConnectionStatus.DISCONNECTED);
                setError(null);
            }, 0);
        };
    }, [channelName, token]);

    // Публичный метод для отправки сообщений из UI-форм ввода
    const sendMessage = (text: string) => {
        clientRef.current?.sendMessage(text);
    };

    return {
        messages,
        status,
        error,
        sendMessage,
        // Полезные хелперы для быстрой проверки состояния в UI
        isConnected: status === TwitchConnectionStatus.CONNECTED,
        isConnecting: status === TwitchConnectionStatus.CONNECTING,
        hasError: status === TwitchConnectionStatus.ERROR
    };
};
