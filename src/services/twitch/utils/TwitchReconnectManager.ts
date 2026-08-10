import {getReconnectDelay} from "./getReconnectDelay.ts";

interface ReconnectConfig {
    maxAttempts?: number;
    onReconnectTriggered: () => void;
}

/**
 * Менеджер управления политикой автоматических переподключений для Twitch IRC.
 */
export class TwitchReconnectManager {
    private attempts = 0;
    private readonly maxAttempts: number;
    private timerId: ReturnType<typeof setTimeout> | null = null;
    private isIntentionallyDisconnected = false;
    private readonly onReconnectTriggered: () => void;

    constructor(config: ReconnectConfig) {
        this.maxAttempts = config.maxAttempts ?? 5;
        this.onReconnectTriggered = config.onReconnectTriggered;
    }

    public get currentAttempts(): number {
        return this.attempts;
    }

    public get isLimitReached(): boolean {
        return this.attempts >= this.maxAttempts;
    }

    public get isIntentionally(): boolean {
        return this.isIntentionallyDisconnected;
    }

    public setIntentionallyDisconnected(value: boolean): void {
        this.isIntentionallyDisconnected = value;
    }

    public incrementAttempts(): void {
        this.attempts++;
    }

    public resetAttempts(): void {
        this.attempts = 0;
    }

    /**
     * Очищает активный таймер переподключения.
     */
    public clearTimer(): void {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Запускает таймер переподключения с экспоненциальной задержкой.
     */
    public trigger(hasSessionParams: boolean): void {
        if (this.isIntentionallyDisconnected) return;

        if (!hasSessionParams) {
            console.error("[TwitchReconnectManager] Подключение невозможно: отсутствуют параметры сессии");
            return;
        }

        if (this.isLimitReached) {
            console.error(`[TwitchReconnectManager] Исчерпан лимит переподключений (${this.maxAttempts}). Остановка.`);
            this.resetAttempts();
            return;
        }

        this.incrementAttempts();

        const delay = getReconnectDelay(this.attempts);
        const delayInSeconds = (delay / 1000).toFixed(1);

        console.info(`[TwitchReconnectManager] Попытка переподключения ${this.attempts}/${this.maxAttempts} через ${delayInSeconds} сек...`);

        this.clearTimer();
        this.timerId = setTimeout(() => {
            this.onReconnectTriggered();
        }, delay);
    }
}
