import { useState, useEffect, useCallback, useRef } from 'react'
import { TWITCH_AUTH_STAGES, type TwitchAuthHookResult, type TwitchUserSession } from '../types'
import { useTwitchPopup } from './useTwitchPopup.ts'
import { useTwitchChannelState } from './useTwitchChannelState.ts'
import {
  AUTH_STATE_VALIDATION_RESULTS,
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
import { clearAuthRedirectUrl, isAuthPopupWindow, openAuthBroadcastChannel, postAuthResult } from '../utils/authRedirect.ts'
import { consumeAuthAttempt } from '../utils/crypto.ts'
import { formatAuthError } from '../utils/formatAuthError.ts'
import { buildTwitchSession, isValidTwitchSession, getTwitchAccessToken } from '../utils/twitchSession.ts'
import { isWebStorageAvailable } from '../../../hooks/utils/webStorage.utils.ts'

/**
 * Проверяет одноразовый `state` и возвращает текст ошибки при неудаче.
 *
 * @param state - Значение `state` из ответа Twitch.
 * @returns Текст ошибки или `null`, если проверка пройдена.
 */
const getAuthStateError = (state: string | null): string | null => {
  const { result } = consumeAuthAttempt(state)

  if (result === AUTH_STATE_VALIDATION_RESULTS.UNAVAILABLE) return TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_UNAVAILABLE
  if (result === AUTH_STATE_VALIDATION_RESULTS.INVALID) return TWITCH_AUTH_UI_MESSAGES.CSRF_FAILED

  return null
}

/**
 * Основной хук авторизации Twitch: хранит сессию текущей вкладки,
 * валидирует токен и обрабатывает результат возврата из Twitch.
 *
 * @returns Полный набор данных и действий для работы с авторизацией.
 */
export const useTwitchAuth = (): TwitchAuthHookResult => {
  const [storedSession, setSession] = useSessionStorage<TwitchUserSession | null>(AUTH_STORAGE_KEYS.SESSION, null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isProcessingHash = useRef(false)

  const session = isValidTwitchSession(storedSession) ? storedSession : null
  const accessToken = getTwitchAccessToken(storedSession)
  const canLoginInCurrentTab = isWebStorageAvailable('sessionStorage')
  const isStoragePersistent = canLoginInCurrentTab && isWebStorageAvailable('localStorage')

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
   * @throws {Error} Если токен недействителен или Twitch недоступен.
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

    setSession(buildTwitchSession(token, result.user))
  }, [setSession])

  const popupManager = useTwitchPopup({
    onSuccess: saveSession,
    setError,
  })

  const { setAuthStage, setIsModalOpen, authorizeToken } = popupManager

  /**
   * Показывает ошибку авторизации в модальном окне.
   *
   * @param message - Текст ошибки.
   */
  const showAuthError = useCallback((message: string): void => {
    setAuthStage(TWITCH_AUTH_STAGES.ERROR)
    setError(message)
    setIsModalOpen(true)
  }, [setAuthStage, setError, setIsModalOpen])

  const channelManager = useTwitchChannelState(session?.login)

  const { displayName: activeChannelDisplayName, avatarUrl: activeChannelAvatar } = useChannelProfile({
    channel: channelManager.activeChannel,
    accessToken: session?.accessToken,
  })

  const {
    displayName: userDisplayName,
    avatarUrl: userAvatar,
  } = useChannelProfile({
    channel: session?.login ?? null,
    accessToken: session?.accessToken,
  })

  /**
   * Сбрасывает состояние авторизации.
   */
  const logout = useCallback((): void => {
    setSession(null)
    setError(null)
    setAuthStage(TWITCH_AUTH_STAGES.IDLE)
    setIsModalOpen(false)
  }, [setSession, setAuthStage, setIsModalOpen])

  /**
   * Синхронизирует сохранённую сессию с состоянием Twitch.
   *
   * @param token - Токен доступа OAuth.
   */
  const syncSession = useCallback(async (token: string): Promise<void> => {
    const { session: validated, shouldLogout } = await validateSession(token)

    if (shouldLogout) {
      logout()
      return
    }

    if (validated) {
      setSession(validated)
    }
  }, [validateSession, setSession, logout])

  useEffect(() => {
    if (storedSession === null || accessToken) return

    console.error(TWITCH_SESSION_ERRORS.CORRUPTED)
    setSession(null)
  }, [storedSession, accessToken, setSession])

  useEffect(() => {
    const handleAuthInit = async (): Promise<void> => {
      if (isProcessingHash.current) return
      isProcessingHash.current = true

      setIsLoading(true)

      const isPopup = isAuthPopupWindow()

      try {
        const response = parseTwitchAuthResponse()

        if (isPopup) {
          const stateError = getAuthStateError(response.state)

          if (stateError) {
            showAuthError(stateError)
          } else {
            const channel = openAuthBroadcastChannel()
            postAuthResult(channel, response)
            channel.close()
          }

          return
        }

        if (response.error) {
          consumeAuthAttempt(response.state)
          showAuthError(formatAuthError(response.error))
          return
        }

        if (response.token) {
          const stateError = getAuthStateError(response.state)

          if (stateError) {
            showAuthError(stateError)
            return
          }

          await authorizeToken(response.token)
          return
        }

        if (accessToken) {
          await syncSession(accessToken)
        }
      } finally {
        clearAuthRedirectUrl()
        setIsLoading(false)

        if (isPopup) {
          window.close()
        }
      }
    }

    handleAuthInit().catch(err => {
      console.error(TWITCH_SESSION_ERRORS.INIT_FAILED, err)
      showAuthError(TWITCH_AUTH_UI_MESSAGES.INIT_FAILED)
    })
  }, [accessToken, authorizeToken, syncSession, showAuthError])

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
    isLoading,
    error,
    channelError: channelManager.channelError,
    logout,
    login: popupManager.login,
    loginInCurrentTab: popupManager.loginInCurrentTab,
    canLoginInCurrentTab,
    isStoragePersistent,
    isModalOpen: popupManager.isModalOpen,
    authStage: popupManager.authStage,
    closeModal: popupManager.closeModal,
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
