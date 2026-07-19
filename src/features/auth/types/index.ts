import type {TwitchUserData} from "../../../services/twitch/validateTwitchToken.ts";

export interface TwitchUserSession extends TwitchUserData {
    accessToken: string;
}

export interface TwitchAuthHookResult {
    session: TwitchUserSession | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
}
