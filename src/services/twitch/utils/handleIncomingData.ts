import type {ParsedMessage} from "../parseChatMessage.ts";
import {handleAuthError} from "./handleAuthError.ts";
import {handlePingPong} from "./handlePingPong.ts";
import {handlePrivmsg} from "./handlePrivmsg.ts";
import {
    TwitchConnectionStatus,
    type TwitchConnectionStatusType,
    TwitchErrorType,
    type TwitchErrorTypeValues
} from "../../../constants";
import {handleConnectSuccess} from "./handleConnectSuccess.ts";

interface IncomingDataContext {
    ws: WebSocket | null;
    onMessageListener: ((message: ParsedMessage) => void) | null;
    onStatusListener: ((status: TwitchConnectionStatusType) => void) | null;
    onErrorListener: ((errorType: TwitchErrorTypeValues) => void) | null;
    onConnectSuccess?: () => void;
}

/**
 * Разбирает входящий поток сырых данных от Twitch IRC.
 */
export const handleIncomingData = (event: MessageEvent, context: IncomingDataContext): void => {
    const rawData = event.data as string;
    const lines = rawData.split('\r\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // 1. Проверка на успешное подключение и вход в канал
        if (handleConnectSuccess(trimmedLine)) {
            context.onConnectSuccess?.();
            continue;
        }

        // 2. Проверка на ошибку невалидного OAuth-токена
        if (handleAuthError(trimmedLine)) {
            context.onStatusListener?.(TwitchConnectionStatus.ERROR);
            context.onErrorListener?.(TwitchErrorType.AUTH_FAILED);
            continue;
        }

        // 3. Обработка PING-PONG
        if (handlePingPong(trimmedLine, context.ws)) {
            continue;
        }

        // 4. Обработка пользовательских сообщений PRIVMSG
        const parsedMessage = handlePrivmsg(trimmedLine);
        if (parsedMessage) {
            context.onMessageListener?.(parsedMessage);
        }
    }
};
