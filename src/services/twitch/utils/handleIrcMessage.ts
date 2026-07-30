import {handleIrcPingPong} from "./handleIrcPingPong.ts";
import {type ParsedIrcMessage, parseIrcMessage} from "./parseIrcMessage.ts";

interface HandleIrcMessageProps {
    event: MessageEvent;
    socket: WebSocket;
    emitMessage: (message: ParsedIrcMessage) => void;
}

/**
 * Обрабатывает входящие сырые сообщения от Twitch IRC сокета.
 * Автоматически отвечает на PING-запросы для поддержания сессии.
 */
/**
 * Главный диспетчер входящих сообщений.
 * Маршрутизирует сырые данные по специализированным обработчикам.
 */
export const handleIrcMessage = ({event, socket, emitMessage}: HandleIrcMessageProps): void => {
    const rawMessage = event.data as string;

    // 1. Проверка и автоматический ответ на системный PING
    const isPing = handleIrcPingPong({rawMessage, socket});
    if (isPing) return;

    // 2. Парсим сообщение
    const parsed = parseIrcMessage(rawMessage);
    if (!parsed) return;

    // 3. Отправляем левой и правой панели через систему подписок
    emitMessage(parsed);
};
