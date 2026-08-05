import type {TwitchUserData} from "../utils";

export interface TwitchUserSession extends TwitchUserData {
    accessToken: string;
}

export const AUTH_STAGES = {
    IDLE: 'idle',
    WAITING: 'waiting',
    VALIDATING: 'validating',
    SUCCESS: 'success',
    ERROR: 'error'
} as const;

export type AuthStage = typeof AUTH_STAGES[keyof typeof AUTH_STAGES];

export interface TwitchAuthHookResult {
    session: TwitchUserSession | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    channelError: string | null;
    login: () => void;
    logout: () => void;
    isModalOpen: boolean;
    authStage: AuthStage;
    closeModal: () => void;
    activeChannel: string | null;
    hasSelectedChannel: boolean;
    activeChannelDisplayName: string | null;
    activeChannelAvatar: string | null;
    isChannelModalOpen: boolean;
    openChannelModal: () => void;
    closeChannelModal: () => void;
    selectOwnChannel: () => void;
    selectCustomChannel: (channelName: string) => void;
    resetChannel: () => void;
}
