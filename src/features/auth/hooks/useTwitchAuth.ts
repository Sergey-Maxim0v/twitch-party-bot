import { useState, useEffect, useCallback, useRef } from 'react'
import type { TwitchAuthHookResult, TwitchUserSession } from '../types'
import { useTwitchLogin } from './useTwitchLogin.ts'
import { useTwitchChannelState } from './useTwitchChannelState.ts'
import {
  TWITCH_AUTH_UI_MESSAGES,
  TWITCH_SESSION_ERRORS,
  TWITCH_TOKEN_VALIDATION_INTERVAL_MS,
  TWITCH_TOKEN_VALIDATION_STATUSES,
} from '../../../constants/auth.constants.ts'
import { AUTH_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { useChannelProfile } from './useChannelProfile.ts'
import { useSessionStorage } from '../../../hooks/useSessionStorage.ts'
import { validateTwitchToken } from '../utils/validateTwitchToken.ts'
import { parseTwitchAuthResponse } from '../utils/parseTwitchAuthResponse.ts'
import { clearAuthRedirectUrl } from '../utils/clearAuthRedirectUrl.ts'
import { consumeAuthAttempt } from '../utils/consumeAuthAttempt.ts'
import { formatAuthError } from '../utils/formatAuthError.ts'
import { buildTwitchSession, isValidTwitchSession, getTwitchAccessToken } from '../utils/twitchSession.ts'
import { isWebStorageAvailable } from '../../../hooks/utils/webStorage.utils.ts'
import { getStateErrorMessage } from '../utils/getStateErrorMessage.ts'
import { getCancelledAuthMessage } from '../utils/getCancelledAuthMessage.ts'

/**
 * Основной хук авторизации Twitch: хранит сессию текущей вкладки,
 * валидирует токен, обрабатывает возврат из Twitch и истечение сессии.
 *
 * @returns Полный набор данных и действий для работы с авторизацией.
 */
export const useTwitchAuth = (): TwitchAuthHookResult => {
  const [storedSession, setSession] = useSessionStorage<TwitchUserSession | null>(AUTH_STORAGE_KEYS.SESSION, null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false)

  const isAuthInitStarted = useRef(false)

  const session = isValidTwitchSession(storedSession) ? storedSession : null
  const accessToken = getTwitchAccessToken(storedSession)
  const isStoragePersistent = isWebStorageAvailable('sessionStorage') && isWebStorageAvailable('localStorage')

  /**
   * Проверяет токен и формирует сессию. Сетевые ошибки не требуют выхода.
   *
   * @param token - Токен доступа OAuth.
   * @returns Сессия пользователя и признак того, что нужно выйти из аккаунта.
   */
  const validateSession = useCallback(async (token: string): Promise<{
    session: TwitchUserSession | null;
    shouldLogout: boolean;
  }> => {
    const result = await validateTwitchToken(token)

    if (result.status !== TWITCH_TOKEN_VALIDATION_STATUSES.VALID) {
      return {
        session: null,
        shouldLogout: result.status === TWITCH_TOKEN_VALIDATION_STATUSES.INVALID,
      }
    }

    return {
      session: buildTwitchSession(token, result.user),
      shouldLogout: false,
    }
  }, [])

  /**
   * Проверяет токен и сохраняет сессию.
   *
   * @param token - Токен доступа OAuth.
   * @throws Error Если токен недействителен или Twitch недоступен.
   */
  const saveSession = useCallback(async (token: string): Promise<void> => {
    const result = await validateTwitchToken(token)

    if (result.status !== TWITCH_TOKEN_VALIDATION_STATUSES.VALID) {
      throw new Error(
        result.status === TWITCH_TOKEN_VALIDATION_STATUSES.UNAVAILABLE
          ? TWITCH_AUTH_UI_MESSAGES.VALIDATION_UNAVAILABLE
          : TWITCH_AUTH_UI_MESSAGES.VALIDATION_FAILED,
      )
    }

    setIsSessionExpired(false)
    setSession(buildTwitchSession(token, result.user))
  }, [setSession])

  const {
    isModalOpen,
    authStage,
    login,
    failAuth,
    closeModal,
    authorizeToken,
  } = useTwitchLogin({ onSuccess: saveSession, setError })

  const channelManager = useTwitchChannelState(session?.login)

  const clearSession = useCallback((): void => {
    setSession(null)
    setError(null)
    closeModal()
  }, [setSession, closeModal])

  /**
   * Завершает сессию по действию пользователя.
   */
  const logout = useCallback((): void => {
    setIsSessionExpired(false)
    clearSession()
  }, [clearSession])

  /**
   * Завершает сессию из-за истёкшего или отозванного токена.
   */
  const expireSession = useCallback((): void => {
    setIsSessionExpired(true)
    clearSession()
  }, [clearSession])

  const { displayName: activeChannelDisplayName, avatarUrl: activeChannelAvatar } = useChannelProfile({
    channel: channelManager.activeChannel,
    accessToken: session?.accessToken,
    onUnauthorized: expireSession,
  })

  const {
    displayName: userDisplayName,
    avatarUrl: userAvatar,
  } = useChannelProfile({
    channel: session?.login ?? null,
    accessToken: session?.accessToken,
    onUnauthorized: expireSession,
  })

  /**
   * Синхронизирует сохранённую сессию с состоянием Twitch.
   *
   * @param token - Токен доступа OAuth.
   */
  const syncSession = useCallback(async (token: string): Promise<void> => {
    const { session: validated, shouldLogout } = await validateSession(token)

    if (shouldLogout) {
      expireSession()
      return
    }

    if (validated) {
      setIsSessionExpired(false)
      setSession(validated)
    }
  }, [validateSession, setSession, expireSession])

  useEffect(() => {
    if (storedSession === null || accessToken) return

    console.error(TWITCH_SESSION_ERRORS.CORRUPTED)
    setSession(null)
  }, [storedSession, accessToken, setSession])

  /**
   * Обрабатывает ответ Twitch или сообщает об отменённом входе.
   */
  const processAuthResponse = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    try {
      const response = parseTwitchAuthResponse()

      // Попытка входа потребляется единственный раз: запись удаляется при любом
      // исходе, поэтому висящий `state` не засчитается следующему запросу.
      const { result, attempt } = consumeAuthAttempt(response.state)

      if (response.error) {
        failAuth(formatAuthError(response.error))
        return
      }

      const stateError = response.token ? getStateErrorMessage(result) : null

      if (stateError) {
        failAuth(stateError)
        return
      }

      if (response.token) {
        await authorizeToken(response.token)
        return
      }

      if (attempt) {
        failAuth(getCancelledAuthMessage(result))
        return
      }

      if (accessToken) {
        await syncSession(accessToken)
      }
    } finally {
      clearAuthRedirectUrl()
      setIsLoading(false)
    }
  }, [accessToken, authorizeToken, failAuth, syncSession])

  /**
   * Сообщает о непредвиденной ошибке обработки ответа Twitch.
   *
   * @param error - Пойманная ошибка.
   */
  const handleAuthInitError = useCallback((error: unknown): void => {
    console.error(TWITCH_SESSION_ERRORS.INIT_FAILED, error)
    failAuth(TWITCH_AUTH_UI_MESSAGES.INIT_FAILED)
  }, [failAuth])

  useEffect(() => {
    if (isAuthInitStarted.current) return
    isAuthInitStarted.current = true

    processAuthResponse().catch(handleAuthInitError)
  }, [processAuthResponse, handleAuthInitError])

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent): void => {
      if (!event.persisted || accessToken) return

      processAuthResponse().catch(handleAuthInitError)
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [accessToken, processAuthResponse, handleAuthInitError])

  useEffect(() => {
    if (!accessToken) return

    const interval = setInterval(async () => {
      await syncSession(accessToken)
    }, TWITCH_TOKEN_VALIDATION_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [accessToken, syncSession])

  return {
    session,
    isAuthenticated: !!session,
    isSessionExpired,
    isLoading,
    error,
    channelError: channelManager.channelError,
    logout,
    expireSession,
    login,
    isStoragePersistent,
    isModalOpen,
    authStage,
    closeModal,
    activeChannel: channelManager.activeChannel,
    hasSelectedChannel: channelManager.hasSelectedChannel,
    activeChannelDisplayName,
    activeChannelAvatar,
    userDisplayName,
    userAvatar,
    isChannelModalOpen: channelManager.isChannelModalOpen,
    openChannelModal: channelManager.openChannelModal,
    closeChannelModal: channelManager.closeChannelModal,
    selectOwnChannel: channelManager.selectOwnChannel,
    selectCustomChannel: channelManager.selectCustomChannel,
    resetChannel: channelManager.resetChannel,
  }
}
