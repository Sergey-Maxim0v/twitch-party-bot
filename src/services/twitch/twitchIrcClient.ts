import {RECONNECT_TIME, TWITCH_SOCKET_BASE_URL} from "./config.ts";
import {sendInitialIrcCommands} from "./utils/sendInitialIrcCommands.ts";
import {handleIrcMessage} from "./utils/handleIrcMessage.ts";
import {createMessageEmitter, type MessageCallback} from "./utils/createMessageEmitter.ts";
import type {ParsedIrcMessage} from "./utils/parseIrcMessage.ts";
import {CONNECTION_STATUSES, type ConnectionStatus} from "../socket/types";

/**
 * Класс управления WebSocket-соединением с Twitch IRC.
 */
export class TwitchIrcClient {
    private socket: WebSocket | null = null;
    private channel: string | null = null;
    private emitter = createMessageEmitter();
    private onChannelChangeCallback: (() => void) | null = null;

    // Параметры для реализации политики автоматического переподключения
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 3;
    private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;
    private isIntentionallyDisconnected = false;

    // Кэш учетных данных для выполнения повторных попыток подключения
    private lastToken: string | null = null;
    private lastUserLogin: string | null = null;

    /**
     * Регистрирует колллбэк, который вызывается непосредственно перед переключением сокета на новый канал.
     * @param {() => void} callback - Функция обратного вызова.
     */
    public onChannelChange(callback: () => void): void {
        this.onChannelChangeCallback = callback;
    }

    /**
     * Подписывает внешние компоненты или хуки на поток успешно распарсенных входящих IRC-сообщений.
     * @param {MessageCallback} callback - Функция обработки входящего сообщения.
     * @returns {() => void} Функция отписки от потока сообщений.
     */
    public subscribe(callback: MessageCallback): () => void {
        return this.emitter.subscribe(callback);
    }

    /**
     * Инициализирует новое WebSocket-соединение с сервером Twitch IRC.
     *
     * @param {string} channel - Название целевого стримерского канала.
     * @param {string} token - Авторизационный OAuth-токен пользователя (Twitch).
     * @param {string} userLogin - Логин авторизованного пользователя/бота.
     */
    public connect(channel: string, token: string, userLogin: string): void {
        if (!channel || !token || !userLogin) {
            return;
        }

        const targetChannel = channel.toLowerCase();

        if (this.socket && this.channel === targetChannel &&
            (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }

        // Сохраняем параметры сессии для возможных будущих реконнектов
        this.channel = targetChannel;
        this.lastToken = token;
        this.lastUserLogin = userLogin;
        this.isIntentionallyDisconnected = false;

        // Смена канала
        if (this.onChannelChangeCallback) {
            this.onChannelChangeCallback();
        }

        this.closeCurrentSocket();

        this.socket = new WebSocket(TWITCH_SOCKET_BASE_URL);
        this.emitStatus(CONNECTION_STATUSES.CONNECTING);

        this.socket.onopen = () => {
            if (!this.socket || !this.channel) return;

            this.reconnectAttempts = 0;
            this.emitStatus(CONNECTION_STATUSES.CONNECTED);

            console.info(`[TwitchIRC Client] Установлено соединение с каналом: ${this.channel}`);

            sendInitialIrcCommands({
                socket: this.socket, token, userLogin, channel: this.channel
            });
        };

        this.socket.onmessage = (event) => {
            if (!this.socket) return;

            handleIrcMessage({
                event,
                socket: this.socket,
                emitMessage: (message: ParsedIrcMessage) => this.emitter.emit(message)
            });
        };

        const currentSocket = this.socket;

        this.socket.onclose = () => {
            if (this.socket === currentSocket) {
                this.cleanup();
                this.emitStatus(CONNECTION_STATUSES.DISCONNECTED);

                this.triggerReconnect();
            }
        };

        this.socket.onerror = (error) => {
            console.error("[TwitchIRC Client] Ошибка сокета:", error);
        };
    }

    /**
     * Ручное отключение от чата пользователем.
     */
    public disconnect(): void {
        this.isIntentionallyDisconnected = true;
        this.clearReconnectTimer();
        this.reconnectAttempts = 0;

        if (!this.socket) return;

        this.socket.close();
    }

    /**
     * Метод жесткого аварийного обрыва сокета.
     */
    public forceCloseAndReconnect(): void {
        console.info("[TwitchIRC Client] Переподключение...");
        this.isIntentionallyDisconnected = false;

        this.closeCurrentSocket();
        this.cleanup();
        this.emitStatus(CONNECTION_STATUSES.DISCONNECTED);

        this.triggerReconnect();
    }

    /**
     * Внутренний диспетчер политики автоматических переподключений.
     */
    private triggerReconnect(): void {
        if (this.isIntentionallyDisconnected) return;

        if (!this.channel || !this.lastToken || !this.lastUserLogin) {
            console.error("[TwitchIRC Client] Подключение невозможно: отсутствуют параметры сессии");
            return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`[TwitchIRC Client] Исчерпан лимит переподключений (${this.maxReconnectAttempts}). Остановка.`);
            this.reconnectAttempts = 0;
            return;
        }

        this.reconnectAttempts++;

        this.emitStatus(CONNECTION_STATUSES.CONNECTING);

        this.clearReconnectTimer();
        this.reconnectTimerId = setTimeout(() => {
            if (this.channel && this.lastToken && this.lastUserLogin) {
                this.connect(this.channel, this.lastToken, this.lastUserLogin);
            }
        }, RECONNECT_TIME);
    }

    /**
     * Отправляет стандартное текстовое сообщение в текущий подключенный чат.
     */
    public sendMessage(text: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.channel) {
            console.error("[TwitchIRC Client] Невозможно отправить сообщение: сокет закрыт или канал не задан");
            return;
        }

        this.socket.send(`PRIVMSG #${this.channel} :${text}`);
    }

    /**
     * Метод отправки низкоуровневых системных строк.
     */
    public sendRaw(text: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("[TwitchIRC Client] Невозможно отправить данные: сокет закрыт");
            return;
        }

        this.socket.send(text);
    }

    private closeCurrentSocket(): void {
        if (this.socket) {
            this.socket.onopen = null;
            this.socket.onmessage = null;
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.close();
            this.socket = null;
        }
    }

    private cleanup(): void {
        this.socket = null;
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimerId) {
            clearTimeout(this.reconnectTimerId);
            this.reconnectTimerId = null;
        }
    }

    /**
     * Возвращает имя текущего целевого канала Twitch IRC.
     */
    public get currentChannel(): TwitchIrcClient["channel"] {
        return this.channel;
    }

    private onStatusChangeCallback: ((status: ConnectionStatus) => void) | null = null;

    /**
     * Регистрирует функцию обратного вызова для уведомления системы о смене сетевого статуса сокета.
     * @param {(status: ConnectionStatus) => void} callback - Коллбэк, принимающий новый статус соединения.
     * @returns {() => void} Функция для безопасной отписки от событий изменения статуса.
     */
    public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        this.onStatusChangeCallback = callback;

        return () => {
            if (this.onStatusChangeCallback === callback) {
                this.onStatusChangeCallback = null;
            }
        };
    }

    private emitStatus(status: ConnectionStatus): void {
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(status);
        }
    }

    /**
     * Возвращает текущее системное состояние готовности нативного сокета (readyState).
     */
    public get readyState(): WebSocket["readyState"] | null {
        return this.socket ? this.socket.readyState : null;
    }
}
