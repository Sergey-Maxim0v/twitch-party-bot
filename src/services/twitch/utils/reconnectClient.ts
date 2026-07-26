import {TWITCH_RECONNECT_DELAY_MS, TWITCH_RECONNECT_MAX_ATTEMPTS} from '../config';

interface ReconnectContext {
    reconnectAttempts: number;
    incrementAttempts: () => number;
    resetAttempts: () => void;
    connect: () => void;
    disconnect: () => void;
}

/**
 * Управляет логикой автоматического повторного подключения к Twitch IRC с задержкой.
 */
export const reconnectClient = (context: ReconnectContext): void => {
    const currentAttempts = context.incrementAttempts();

    if (currentAttempts > TWITCH_RECONNECT_MAX_ATTEMPTS) {
        console.error(`Превышено максимальное количество попыток переподключения (${TWITCH_RECONNECT_MAX_ATTEMPTS}).`);
        context.resetAttempts();
        return;
    }

    console.log(`Попытка переподключения к чату #${currentAttempts} через ${TWITCH_RECONNECT_DELAY_MS / 1000} сек...`);

    // Перед новой попыткой гарантированно очищаем старые ресурсы вебсокета
    context.disconnect();

    setTimeout(() => {
        context.connect();
    }, TWITCH_RECONNECT_DELAY_MS);
};
