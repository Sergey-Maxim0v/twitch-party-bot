import { useState, useEffect, useCallback, useRef } from 'react'
import { TWITCH_AUTH_STAGES, type TwitchAuthHookResult, type TwitchUserSession } from '../types'
import { useTwitchPopup } from './useTwitchPopup.ts'
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
import { clearAuthRedirectUrl, isAuthPopupWindow, sendAuthResultToOpener } from '../utils/authRedirect.ts'
import { formatAuthError } from '../utils/formatAuthError.ts'
import { buildTwitchSession, isValidTwitchSession, getTwitchAccessToken } from '../utils/twitchSession.ts'

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

  // Хранилище не проверяет структуру записи, поэтому повреждённая сессия
  // не должна выглядеть как авторизация: пустой логин не подключит сокет.
  const session = isValidTwitchSession(storedSession) ? storedSession : null

  // Токен берём из сырых данных: повреждённую сессию ещё можно восстановить.
  const accessToken = getTwitchAccessToken(storedSession)

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
    // Запись без токена восстановить нечем — удаляем её.
    if (storedSession === null || accessToken) return

    console.error(TWITCH_SESSION_ERRORS.CORRUPTED)
    setSession(null)
  }, [storedSession, accessToken, setSession])

  useEffect(() => {
    const handleAuthInit = async (): Promise<void> => {
      if (isProcessingHash.current) return
      isProcessingHash.current = true

      setIsLoading(true)

      const response = parseTwitchAuthResponse()

      // Во всплывающем окне результат уходит родительскому окну, а не обрабатывается здесь.
      if (isAuthPopupWindow()) {
        sendAuthResultToOpener(response)
        window.close()
        return
      }

      clearAuthRedirectUrl()

      if (response.error) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(formatAuthError(response.error))
        setIsModalOpen(true)
      }

      if (response.token) {
        await authorizeToken(response.token)
      } else if (accessToken) {
        await syncSession(accessToken)
      }

      setIsLoading(false)
    }

    handleAuthInit().catch(err => {
      console.error(TWITCH_SESSION_ERRORS.INIT_FAILED, err)
    })
  }, [accessToken, authorizeToken, syncSession, setAuthStage, setError, setIsModalOpen])

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
