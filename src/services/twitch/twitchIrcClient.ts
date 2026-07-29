import {TWITCH_SOCKET_BASE_URL} from "./config.ts";

export class TwitchIrcClient {
    private socket: WebSocket | null = null;
    private channel: string | null = null;

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

            this.socket.send(`PASS oauth:${token}`);
            this.socket.send(`NICK ${userLogin.toLowerCase()}`);
            this.socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags');
            this.socket.send(`JOIN #${this.channel}`);
        };

        this.socket.onmessage = (event) => {
            const rawMessage = event.data as string;

            //TODO:
            console.info(rawMessage);

            if (rawMessage.startsWith('PING')) {
                this.socket?.send('PONG :tmi.twitch.tv');
                return;
            }
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
    }
}
