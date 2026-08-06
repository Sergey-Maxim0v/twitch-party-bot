import {TWITCH_SOCKET_BASE_URL, TwitchIrcCommand} from "./config.ts";
import {sendInitialIrcCommands} from "./utils/sendInitialIrcCommands.ts";
import {handleIrcMessage} from "./utils/handleIrcMessage.ts";
import {createMessageEmitter, type MessageCallback} from "./utils/createMessageEmitter.ts";
import type {ParsedIrcMessage} from "./utils/parseIrcMessage.ts";
import {CONNECTION_STATUSES, type ConnectionStatus} from "../socket/types";

export class TwitchIrcClient {
    private socket: WebSocket | null = null;
    private channel: string | null = null;
    private emitter = createMessageEmitter();
    private onChannelChangeCallback: (() => void) | null = null;

    public onChannelChange(callback: () => void): void {
        this.onChannelChangeCallback = callback;
    }

    public subscribe(callback: MessageCallback): () => void {
        return this.emitter.subscribe(callback);
    }

    public connect(channel: string, token: string, userLogin: string): void {
        if (!channel || !token || !userLogin) {
            return;
        }

        const targetChannel = channel.toLowerCase();

        if (this.socket && this.channel === targetChannel &&
            (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
            return;
        }

        if (this.onChannelChangeCallback) {
            this.onChannelChangeCallback();
        }

        if (this.socket) {
            this.socket.close();
        }

        this.channel = targetChannel;
        this.socket = new WebSocket(TWITCH_SOCKET_BASE_URL);
        this.emitStatus(CONNECTION_STATUSES.CONNECTING);

        this.socket.onopen = () => {
            if (!this.socket || !this.channel) return;

            this.emitStatus(CONNECTION_STATUSES.CONNECTED);

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
            }
        };

        this.socket.onerror = (error) => {
            console.error("[TwitchIRC Client] Ошибка сокета:", error);
            this.emitStatus(CONNECTION_STATUSES.DISCONNECTED);
        };
    }

    public disconnect(): void {
        if (!this.socket) return;

        this.socket.close();
        this.cleanup();
    }

    private cleanup(): void {
        this.socket = null;
        this.channel = null;
    }

    public sendMessage(text: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.channel) {
            console.error("[TwitchIRC Client] Невозможно отправить сообщение: сокет закрыт или канал не задан");
            return;
        }

        this.socket.send(`PRIVMSG #${this.channel} :${text}`);
    }

    public get currentChannel(): TwitchIrcClient["channel"] {
        return this.channel;
    }

    private onStatusChangeCallback: ((status: ConnectionStatus) => void) | null = null;

    public onStatusChange(callback: (status: ConnectionStatus) => void): void {
        this.onStatusChangeCallback = callback;
    }

    private emitStatus(status: ConnectionStatus): void {
        if (this.onStatusChangeCallback) {
            this.onStatusChangeCallback(status);
        }
    }

    public get readyState(): WebSocket["readyState"] | null {
        return this.socket ? this.socket.readyState : null;
    }
}
