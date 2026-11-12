import { useState, useEffect, useCallback, useRef } from 'react'
import { TWITCH_AUTH_STAGES, type TwitchAuthHookResult, type TwitchUserSession } from '../types'
import { useTwitchPopup } from './useTwitchPopup.ts'
import { useTwitchChannelState } from './useTwitchChannelState.ts'
import { TWITCH_TOKEN_VALIDATION_INTERVAL_MS, TWITCH_TOKEN_VALIDATION_STATUSES } from '../../../constants/auth.constants.ts'
import { AUTH_STORAGE_KEYS } from '../../../constants/storage.constants.ts'
import { useChannelProfile } from './useChannelProfile.ts'
import { useLocalStorage } from '../../../hooks/useLocalStorage.ts'
import { validateTwitchToken } from '../utils/validateTwitchToken.ts'
import { extractTwitchToken } from '../utils/extractTwitchToken.ts'

/**
 * Основной хук авторизации Twitch: хранит сессию, валидирует токен
 * и связывает между собой popup-авторизацию и выбор канала чата.
 *
 * @returns Полный набор данных и действий для работы с авторизацией.
 */
export const useTwitchAuth = (): TwitchAuthHookResult => {
  const [session, setSession] = useLocalStorage<TwitchUserSession | null>(AUTH_STORAGE_KEYS.SESSION, null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isProcessingHash = useRef(false)

  /**
   * Проверяет токен и формирует сессию. Сетевые ошибки не требуют выхода.
   *
   * @param token - Токен доступа OAuth.
   */
  const validateSession = useCallback(async (token: string): Promise<{
    session: TwitchUserSession | null;
    shouldLogout: boolean;
  }> => {
    const result = await validateTwitchToken(token)

    if (result.status === TWITCH_TOKEN_VALIDATION_STATUSES.VALID) {
      return {
        session: {
          accessToken: token,
          userId: result.user.userId,
          login: result.user.login,
        },
        shouldLogout: false,
      }
    }

    return {
      session: null,
      shouldLogout: result.status === TWITCH_TOKEN_VALIDATION_STATUSES.INVALID,
    }
  }, [])

  /**
   * Обрабатывает результат popup-авторизации.
   *
   * @param token - Токен доступа OAuth.
   * @throws {Error} Если токен недействителен или Twitch недоступен.
   */
  const handlePopupSuccess = useCallback(async (token: string): Promise<void> => {
    const result = await validateTwitchToken(token)

    if (result.status !== TWITCH_TOKEN_VALIDATION_STATUSES.VALID) {
      throw new Error(
        result.status === TWITCH_TOKEN_VALIDATION_STATUSES.UNAVAILABLE
          ? 'Не удалось проверить токен: Twitch недоступен. Проверьте соединение и попробуйте снова.'
          : 'Не удалось подтвердить валидность токена через Twitch API.',
      )
    }

    setSession({
      accessToken: token,
      userId: result.user.userId,
      login: result.user.login,
    })
  }, [setSession])

  const popupManager = useTwitchPopup({
    onSuccess: handlePopupSuccess,
    setError,
  })

  const { setAuthStage, setIsModalOpen } = popupManager

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

  useEffect(() => {
    const handleAuthInit = async (): Promise<void> => {
      if (isProcessingHash.current) return
      isProcessingHash.current = true

      setIsLoading(true)
      extractTwitchToken()

      if (!window.opener && session?.accessToken) {
        const { session: validated, shouldLogout } = await validateSession(session.accessToken)

        if (shouldLogout) logout()

        if (validated) setSession(validated)
      }

      setIsLoading(false)
    }

    handleAuthInit().catch(err => {
      console.error('useTwitchAuth / handleAuthInit error:', err)
    })
  }, [validateSession, setSession, session?.accessToken, logout])

  useEffect(() => {
    if (!session?.accessToken) return

    const interval = setInterval(async () => {
      const { shouldLogout } = await validateSession(session.accessToken)
      if (shouldLogout) {
        logout()
      }
    }, TWITCH_TOKEN_VALIDATION_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [session?.accessToken, validateSession, logout])

  return {
    session,
    isAuthenticated: !!session,
    isLoading,
    error,
    channelError: channelManager.channelError,
    logout,
    login: popupManager.login,
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
