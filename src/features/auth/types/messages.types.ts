export type TwitchAuthMessageType = 'TWITCH_AUTH_RESULT';

export interface TwitchAuthMessageData {
    type: TwitchAuthMessageType;
    token: string | null;
    error: string | null;
}
