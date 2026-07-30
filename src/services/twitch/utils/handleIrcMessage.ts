import {handleIrcPingPong} from "./handleIrcPingPong.ts";
import {type ParsedIrcMessage, parseIrcMessage} from "./parseIrcMessage.ts";

interface HandleIrcMessageProps {
    event: MessageEvent;
    socket: WebSocket;
    emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Главный диспетчер входящих сообщений.
 * Маршрутизирует сырые данные по специализированным обработчикам.
 */
export const handleIrcMessage = ({event, socket, emitMessage}: HandleIrcMessageProps): void => {
    const rawMessage = event.data as string;

    console.log(">>> IRC RAW:", JSON.stringify(rawMessage));

    const lines = rawMessage.split(/\r?\n/);

    for (const line of lines) {

        const trimmedLine = line.trim();

        if (!trimmedLine) continue;

        // 1. Проверка и автоматический ответ на системный PING
        const isPing = handleIrcPingPong({rawMessage: trimmedLine, socket});
        if (isPing) return;

        // 2. Парсим сообщение
        const parsed = parseIrcMessage(trimmedLine);
        if (!parsed) return;

        // 3. Отправляем левой и правой панели через систему подписок
        emitMessage(parsed);
    }
};
