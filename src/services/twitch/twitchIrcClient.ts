import {sendInitialIrcCommands} from "./utils/sendInitialIrcCommands.ts";
import {handleIrcMessage} from "./utils/handleIrcMessage.ts";
import {createMessageEmitter, type MessageCallback} from "./utils/createMessageEmitter.ts";
import type {ParsedIrcMessage} from "./utils/parseIrcMessage.ts";
import {CONNECTION_STATUSES, type ConnectionStatus} from "../socket/types.ts";
import {ConnectionStateManager} from "./utils/ConnectionStateManager.ts";
import {TwitchReconnectManager} from "./utils/TwitchReconnectManager.ts";
import {SocketLifecycleManager} from "./utils/SocketLifecycleManager.ts";

/**
 * Класс управления WebSocket-соединением с Twitch IRC.
 */
export class TwitchIrcClient {
    private channel: string | null = null;
    private emitter = createMessageEmitter();
    private onChannelChangeCallback: (() => void) | null = null;

    private stateManager = new ConnectionStateManager();
    private socketManager = new SocketLifecycleManager();
    private reconnectManager = new TwitchReconnectManager({
        maxAttempts: 5,
        onReconnectTriggered: () => this.retryConnection()
    });

    // Кэш учетных данных для выполнения повторных попыток подключения
    private lastToken: string | null = null;
    private lastUserLogin: string | null = null;

    public onChannelChange(callback: () => void): void {
        this.onChannelChangeCallback = callback;
    }

    /** Подписывает внешние компоненты или хуки на поток успешно распарсенных входящих IRC-сообщений.   */
    public subscribe(callback: MessageCallback): () => void {
        return this.emitter.subscribe(callback);
    }

    public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        return this.stateManager.subscribe(callback);
    }

    public get currentChannel(): string | null {
        return this.channel;
    }

    /** Возвращает текущее системное состояние готовности нативного сокета (readyState).    */
    public get readyState(): WebSocket["readyState"] | null {
        return this.socketManager.readyState;
    }

    public connect(channel: string, token: string, userLogin: string): void {
        if (!channel || !token || !userLogin) return;

        const targetChannel = channel.toLowerCase();
        if (this.channel === targetChannel && this.socketManager.isConnectingOrOpen()) return;

        this.saveSession(targetChannel, token, userLogin);

        if (this.onChannelChangeCallback) {
            this.onChannelChangeCallback();
        }

        this.socketManager.destroy();
        this.stateManager.emit(CONNECTION_STATUSES.CONNECTING);

        this.socketManager.create({
            onOpen: () => this.handleSocketOpen(),
            onMessage: (event) => this.handleSocketMessage(event),
            onClose: () => this.handleSocketClose(),
            onError: (error) => console.error("[TwitchIRC Client] Ошибка сокета:", error)
        });
    }

    private handleSocketOpen(): void {
        if (!this.channel || !this.lastToken || !this.lastUserLogin) return;

        this.reconnectManager.resetAttempts();
        this.stateManager.emit(CONNECTION_STATUSES.CONNECTED);
        console.info(`[TwitchIRC Client] Установлено соединение с каналом: ${this.channel}`);

        const socket = this.socketManager.rawSocket;
        if (socket) {
            sendInitialIrcCommands({
                socket,
                token: this.lastToken,
                userLogin: this.lastUserLogin,
                channel: this.channel
            });
        }
    }

    private handleSocketMessage(event: MessageEvent): void {
        const socket = this.socketManager.rawSocket;
        if (!socket) return;

        handleIrcMessage({
            event,
            socket,
            emitMessage: (message: ParsedIrcMessage) => this.emitter.emit(message)
        });
    }

    private handleSocketClose(): void {
        this.stateManager.emit(CONNECTION_STATUSES.DISCONNECTED);
        this.reconnectManager.trigger(this.hasSessionParams());
    }

    private saveSession(channel: string, token: string, userLogin: string): void {
        this.channel = channel;
        this.lastToken = token;
        this.lastUserLogin = userLogin;
        this.reconnectManager.setIntentionallyDisconnected(false);
    }

    public disconnect(): void {
        this.reconnectManager.setIntentionallyDisconnected(true);
        this.reconnectManager.clearTimer();
        this.reconnectManager.resetAttempts();
        this.socketManager.destroy();
    }

    public forceCloseAndReconnect(): void {
        this.reconnectManager.setIntentionallyDisconnected(false);

        this.socketManager.destroy();
        this.stateManager.emit(CONNECTION_STATUSES.DISCONNECTED);
        this.reconnectManager.trigger(this.hasSessionParams());
    }

    public sendMessage(text: string): void {
        if (!this.socketManager.isOpen() || !this.channel) {
            console.error("[TwitchIRC Client] Невозможно отправить сообщение: сокет закрыт или канал не задан");
            return;
        }
        this.socketManager.send(`PRIVMSG #${this.channel} :${text}`);
    }

    /** Метод отправки низкоуровневых системных строк.  */
    public sendRaw(text: string): void {
        if (!this.socketManager.isOpen()) {
            console.error("[TwitchIRC Client] Невозможно отправить данные: сокет закрыт");
            return;
        }
        this.socketManager.send(text);
    }

    private retryConnection(): void {
        if (this.channel && this.lastToken && this.lastUserLogin) {
            this.stateManager.emit(CONNECTION_STATUSES.CONNECTING);
            this.connect(this.channel, this.lastToken, this.lastUserLogin);
        }
    }

    private hasSessionParams(): boolean {
        return Boolean(this.channel && this.lastToken && this.lastUserLogin);
    }
}
