import { AUTH_STATE_VALIDATION_RESULTS, TWITCH_AUTH_STAGES } from '../../../constants/auth.constants.ts'

export { TWITCH_AUTH_STAGES }

/**
 * Результат проверки OAuth-параметра `state`.
 */
export type AuthStateValidationResult = typeof AUTH_STATE_VALIDATION_RESULTS[keyof typeof AUTH_STATE_VALIDATION_RESULTS]

/**
 * Данные пользователя, полученные при валидации токена Twitch.
 */
export interface TwitchUserData {
  userId: string;
  login: string;
}

/**
 * Результат разбора ответа Twitch OAuth.
 */
export interface TwitchAuthResponse {
  token: string | null;
  error: string | null;
  state: string | null;
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
  loginInCurrentTab: () => void;
  canLoginInCurrentTab: boolean;
  isStoragePersistent: boolean;
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
