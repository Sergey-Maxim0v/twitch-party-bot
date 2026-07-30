import type {ParsedIrcMessage} from "./parseIrcMessage.ts";

export type MessageCallback = (message: ParsedIrcMessage) => void;

/**
 * Создает изолированную систему подписок (Event Emitter)
 * для прослушивания распарсенных сообщений Twitch IRC.
 */
export const createMessageEmitter = () => {
    const listeners = new Set<MessageCallback>();

    return {
        /**
         * Подписывает колбэк на новые сообщения.
         * Возвращает функцию для автоматической отписки.
         */
        subscribe: (callback: MessageCallback): (() => void) => {
            listeners.add(callback);
            return () => {
                listeners.delete(callback);
            };
        },

        /**
         * Оповещает всех подписчиков о новом сообщении.
         */
        emit: (message: ParsedIrcMessage): void => {
            listeners.forEach((callback) => {
                try {
                    callback(message);
                } catch (error) {
                    console.error("[MessageEmitter] Ошибка в колбэке подписчика:", error);
                }
            });
        },

        /**
         * Очищает всех подписчиков.
         */
        clear: (): void => {
            listeners.clear();
        }
    };
};

export type MessageEmitter = ReturnType<typeof createMessageEmitter>;
