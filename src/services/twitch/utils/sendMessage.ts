import {TWITCH_IRC_PRIVMSG} from "../config.ts";

interface SendMessageContext {
    ws: WebSocket | null;
    channel: string;
}

/**
 * Отправляет текстовое сообщение в указанный IRC-канал Twitch,
 * если WebSocket-соединение открыто и готово к работе.
 */
export const sendMessage = (text: string, context: SendMessageContext): void => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (!context.ws || context.ws.readyState !== WebSocket.OPEN) {
        console.warn('Невозможно отправить сообщение: соединение не установлено или закрыто.');
        return;
    }

    context.ws.send(`${TWITCH_IRC_PRIVMSG} #${context.channel} :${trimmedText}`);
};
