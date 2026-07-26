import {TWITCH_IRC_PING, TWITCH_IRC_PONG} from "../config.ts";

/**
 * Обрабатывает системные PING-запросы от сервера Twitch IRC для удержания вебсокет-соединения.
 * @returns {boolean} true — если строка была PING-запросом и обработана, false — в противном случае.
 * @see {@link: https://dev.twitch.tv/docs/eventsub/handling-websocket-events#ping-message}
 */
export const handlePingPong = (line: string, ws: WebSocket | null): boolean => {
    if (line.startsWith(TWITCH_IRC_PING)) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(TWITCH_IRC_PONG);
        }
        return true;
    }
    return false;
};
