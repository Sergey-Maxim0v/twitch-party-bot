import type {ConnectionStatus} from "../../socket/types.ts";

/**
 * Менеджер управления подписками на сетевой статус соединения.
 */
export class ConnectionStateManager {
    private callbacks = new Set<(status: ConnectionStatus) => void>();

    /**
     * Регистрирует коллбэк для уведомления об изменении статуса.
     * @returns Функция отписки.
     */
    public subscribe(callback: (status: ConnectionStatus) => void): () => void {
        this.callbacks.add(callback);
        return () => {
            this.callbacks.delete(callback);
        };
    }

    /**
     * Безопасно уведомляет всех подписчиков о новом статусе.
     */
    public emit(status: ConnectionStatus): void {
        this.callbacks.forEach((callback) => {
            try {
                callback(status);
            } catch (error) {
                console.error("[ConnectionStateManager] Ошибка в onStatusChange коллбэке:", error);
            }
        });
    }

    /**
     * Очищает все зарегистрированные подписки.
     */
    public clear(): void {
        this.callbacks.clear();
    }
}
