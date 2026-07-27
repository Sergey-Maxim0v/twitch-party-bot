import type {ParsedMessage} from "./parseChatMessage.ts";
import {type TwitchConnectionStatusType, type TwitchErrorTypeValues} from "../../constants";
import {connectClient} from "./utils/connectClient.ts";
import {disconnectClient} from "./utils/disconnectClient.ts";
import {handleIncomingData} from "./utils/handleIncomingData.ts";
import {sendMessage} from "./utils/sendMessage.ts";
import {reconnectClient} from "./utils/reconnectClient.ts";
import type {ParsedBanEvent} from "./utils/parseBanEvent.ts";

// Описание типов для колбэков, которые React-компоненты смогут передавать в класс
export type OnMessageCallback = (message: ParsedMessage) => void;
export type OnStatusChangeCallback = (status: TwitchConnectionStatusType) => void;
export type OnErrorCallback = (errorType: TwitchErrorTypeValues) => void;
export type OnBanEventCallback = (event: ParsedBanEvent) => void;

export class TwitchIrcClient {
    private ws: WebSocket | null = null;
    private channel: string;
    private token: string;

    private reconnectAttempts = 0;

    // Хранилища для колбэков (Вариант А)
    private onMessageListener: OnMessageCallback | null = null;
    private onStatusListener: OnStatusChangeCallback | null = null;
    private onErrorListener: OnErrorCallback | null = null;
    private onBanEventListener: OnBanEventCallback | null = null;

    constructor(channel: string, token: string) {
        this.channel = channel.toLowerCase().replace('#', '').trim();
        this.token = token.startsWith('oauth:') ? token : `oauth:${token}`;
    }

    // Методы подписки на события для внешних компонентов
    public onMessage(callback: OnMessageCallback): void {
        this.onMessageListener = callback;
    }

    public onStatusChange(callback: OnStatusChangeCallback): void {
        this.onStatusListener = callback;
    }

    public onError(callback: OnErrorCallback): void {
        this.onErrorListener = callback;
    }

    public onBanEvent(callback: OnBanEventCallback): void {
        this.onBanEventListener = callback;
    }

    // Основные методы управления соединением
    public connect(): void {
        connectClient({
            ws: this.ws,
            channel: this.channel,
            token: this.token,
            onStatusListener: this.onStatusListener,
            onErrorListener: this.onErrorListener,
            handleIncomingData: (event) => this.handleIncomingData(event),
            setWs: (ws) => {
                this.ws = ws;
            },
            triggerReconnect: () => this.triggerReconnect()
        });
    }

    public disconnect(): void {
        this.reconnectAttempts = 0;
        disconnectClient({
            ws: this.ws,
            onStatusListener: this.onStatusListener,
            setWs: (ws) => {
                this.ws = ws;
            }
        });
    }

    // Метод отправки сообщений в чат
    public sendMessage(text: string): void {
        sendMessage(text, {
            ws: this.ws,
            channel: this.channel
        });
    }

    // Внутренний метод активации цикла переподключения
    private triggerReconnect(): void {
        reconnectClient({
            reconnectAttempts: this.reconnectAttempts,
            incrementAttempts: () => {
                this.reconnectAttempts += 1;
                return this.reconnectAttempts;
            },
            resetAttempts: () => {
                this.reconnectAttempts = 0;
            },
            connect: () => this.connect(),
            disconnect: () => this.disconnect()
        });
    }

    // Внутренний обработчик сырого трафика WebSocket
    private handleIncomingData(event: MessageEvent): void {
        handleIncomingData(event, {
            ws: this.ws,
            onMessageListener: this.onMessageListener,
            onStatusListener: this.onStatusListener, // Передаем для изменения статуса при AUTH_FAILED
            onErrorListener: this.onErrorListener,   // Передаем для вызова ошибки авторизации
            onConnectSuccess: () => {
                this.reconnectAttempts = 0;
            },
            onBanEventListener: (banEvent) => {
                this.onBanEventListener?.(banEvent);
            } // Передаем событие бана вверх
        });
    }
}
