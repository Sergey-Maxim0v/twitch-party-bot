import { AUTH_CONTEXT_TYPE, AUTH_STATE_VALIDATION_RESULTS, TWITCH_AUTH_STAGES } from '../../../constants/auth.constants.ts'

export { TWITCH_AUTH_STAGES }

/**
 * Результат проверки OAuth-параметра `state`.
 */
export type AuthStateValidationResult = typeof AUTH_STATE_VALIDATION_RESULTS[keyof typeof AUTH_STATE_VALIDATION_RESULTS]

/**
 * Контекст входа: всплывающее окно или текущая вкладка.
 */
export type AuthContextType = typeof AUTH_CONTEXT_TYPE[keyof typeof AUTH_CONTEXT_TYPE]

/**
 * Попытка входа, сохраняемая перед редиректом на Twitch.
 */
export interface AuthAttempt {
  state: string;
  contextType: AuthContextType;
  createdAt: number;
}

/**
 * Результат чтения попытки входа и сверки `state`.
 */
export interface AuthAttemptCheckResult {
  result: AuthStateValidationResult;
  attempt: AuthAttempt | null;
}

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
