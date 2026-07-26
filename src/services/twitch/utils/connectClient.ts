import {
    TwitchConnectionStatus,
    type TwitchConnectionStatusType,
    TwitchErrorType,
    type TwitchErrorTypeValues, WS_CLOSE_NORMAL
} from "../../../constants";

interface ConnectContext {
    ws: WebSocket | null;
    channel: string;
    token: string;
    onStatusListener: ((status: TwitchConnectionStatusType) => void) | null;
    onErrorListener: ((errorType: TwitchErrorTypeValues) => void) | null; // Добавили слушатель ошибок
    handleIncomingData: (event: MessageEvent) => void;
    setWs: (ws: WebSocket | null) => void;
    triggerReconnect: () => void;
}

/**
 * Инициализирует WebSocket соединение с сервером Twitch IRC и проходит авторизацию.
 *@see {@link https://dev.twitch.tv/docs/eventsub/handling-websocket-events}
 */
export const connectClient = (context: ConnectContext): void => {
    if (context.ws && (context.ws.readyState === WebSocket.OPEN || context.ws.readyState === WebSocket.CONNECTING)) {
        return;
    }

    context.onStatusListener?.(TwitchConnectionStatus.CONNECTING);

    const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    context.setWs(ws);

    ws.onopen = () => {
        // Авторизация на сервере Twitch IRC
        ws.send(`PASS ${context.token}`);
        ws.send('NICK party_queue_bot'); // Имя бота может быть любым для чтения чата
        ws.send(`JOIN #${context.channel}`);

        // Запрашиваем теги (id сообщений, цвета, таймстампы)
        ws.send('CAP REQ :twitch.tv/tags');

        context.onStatusListener?.(TwitchConnectionStatus.CONNECTED);
    };

    ws.onmessage = (event: MessageEvent) => {
        context.handleIncomingData(event);
    };

    ws.onclose = (event: CloseEvent) => {
        // Если соединение закрылось аварийно (не кодом 1000 - нормальное закрытие)
        if (!event.wasClean || event.code !== WS_CLOSE_NORMAL) {
            context.onStatusListener?.(TwitchConnectionStatus.ERROR);
            context.onErrorListener?.(TwitchErrorType.CONNECTION_FAILED);
            context.triggerReconnect(); // Запуск логики повторных попыток
        } else {
            context.onStatusListener?.(TwitchConnectionStatus.DISCONNECTED);
        }
    };

    ws.onerror = () => {
        // Вебсокет упал из-за сетевого сбоя (нет интернета, сервер недоступен)
        context.onStatusListener?.(TwitchConnectionStatus.ERROR);
        context.onErrorListener?.(TwitchErrorType.CONNECTION_FAILED);
        context.triggerReconnect(); // Запуск логики повторных попыток при падении сети
    };
};
