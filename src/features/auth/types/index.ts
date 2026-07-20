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
    isModalOpen: boolean;
    authStage: 'idle' | 'waiting' | 'validating' | 'success' | 'error';
    closeModal: () => void;
    activeChannel: string | null;
    hasSelectedChannel: boolean;
    selectOwnChannel: () => void;
    selectCustomChannel: (channelName: string) => void;
    resetChannel: () => void;
}
