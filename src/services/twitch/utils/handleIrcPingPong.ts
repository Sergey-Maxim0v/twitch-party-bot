import {TwitchIrcCommand} from "../config.ts";

interface HandleIrcPingProps {
    rawMessage: string;
    socket: WebSocket;
}

export const PONG_MESSAGE = "PONG :tmi.twitch.tv"

/**
 * Проверяет сообщение на PING от сервера Twitch и отправляет PONG для поддержания сессии.
 * Возвращает true, если сообщение было PING-запросом.
 */
export const handleIrcPingPong = ({rawMessage, socket}: HandleIrcPingProps): boolean => {
    if (rawMessage.startsWith(TwitchIrcCommand.PING)) {
        socket.send(PONG_MESSAGE);
        return true;
    }

    return false;
};
