import {TwitchConnectionStatus, type TwitchConnectionStatusType} from "../../../constants";

interface DisconnectContext {
    ws: WebSocket | null;
    onStatusListener: ((status: TwitchConnectionStatusType) => void) | null;
    setWs: (ws: WebSocket | null) => void;
}

/**
 * Безопасно закрывает WebSocket соединение с IRC сервером Twitch
 * и очищает системные ресурсы.
 * @see {@link https://dev.twitch.tv/docs/eventsub/handling-websocket-events}
 * */
export const disconnectClient = (context: DisconnectContext): void => {
    if (!context.ws) return;

    // Удаляем обработчики, чтобы избежать повторных вызовов при ручном закрытии
    context.ws.onopen = null;
    context.ws.onmessage = null;
    context.ws.onerror = null;
    context.ws.onclose = null;

    // Если соединение еще открыто — закрываем его
    if (context.ws.readyState === WebSocket.OPEN || context.ws.readyState === WebSocket.CONNECTING) {
        context.ws.close();
    }

    // Обнуляем состояние вебсокета в контексте клиента
    context.setWs(null);

    // Уведомляем React-компоненты об успешном отключении
    context.onStatusListener?.(TwitchConnectionStatus.DISCONNECTED);
};
