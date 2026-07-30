import {TWITCH_SOCKET_BASE_URL} from "./config.ts";
import {sendInitialIrcCommands} from "./utils/sendInitialIrcCommands.ts";
import {handleIrcMessage} from "./utils/handleIrcMessage.ts";
import {createMessageEmitter, type MessageCallback} from "./utils/createMessageEmitter.ts";
import type {ParsedIrcMessage} from "./utils/parseIrcMessage.ts";


export class TwitchIrcClient {
    private socket: WebSocket | null = null;
    private channel: string | null = null;
    private emitter = createMessageEmitter();

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

        if (this.socket) {
            this.socket.close();
            this.cleanup();
        }

        this.channel = targetChannel;
        this.socket = new WebSocket(TWITCH_SOCKET_BASE_URL);

        this.socket.onopen = () => {
            if (!this.socket || !this.channel) return;

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
            }
        };

        this.socket.onerror = (error) => {
            console.error("[TwitchIRC Client] Ошибка сокета:", error);
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
        this.emitter.clear();
    }
}
