import { TWITCH_AUTH_STAGES } from '../../../constants/auth.constants.ts'

export { TWITCH_AUTH_STAGES }

/**
 * Данные пользователя, полученные при валидации токена Twitch.
 */
export interface TwitchUserData {
  userId: string;
  login: string;
}

/**
 * Сохранённая сессия авторизованного пользователя.
 */
export interface TwitchUserSession extends TwitchUserData {
  accessToken: string;
}

/**
 * Стадия процесса авторизации.
 */
export type AuthStage = typeof TWITCH_AUTH_STAGES[keyof typeof TWITCH_AUTH_STAGES]

/**
 * Публичный контракт хука `useAuth`.
 */
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
  userDisplayName: string | null;
  userAvatar: string | null;
  isChannelModalOpen: boolean;
  openChannelModal: () => void;
  closeChannelModal: () => void;
  selectOwnChannel: () => void;
  selectCustomChannel: (channelName: string) => void;
  resetChannel: () => void;
}
