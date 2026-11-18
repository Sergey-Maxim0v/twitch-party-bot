import { useCallback, useState } from 'react'
import { type AuthStage, TWITCH_AUTH_STAGES } from '../types'
import {
  TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS,
  TWITCH_AUTH_UI_MESSAGES,
} from '../../../constants/auth.constants.ts'
import { createTwitchAuthRequest } from '../utils/getTwitchAuthUrl.ts'
import { getAuthErrorMessage } from '../utils/formatAuthError.ts'
import { saveAuthAttempt } from '../utils/saveAuthAttempt.ts'

interface UseTwitchLoginProps {
  onSuccess: (token: string) => Promise<void>;
  setError: (err: string | null) => void;
}

/**
 * Управляет входом через Twitch и стадиями модального окна.
 *
 * Вход выполняется редиректом текущей вкладки, поэтому результат
 * обрабатывается в том же окне, где сохранена попытка входа.
 *
 * @param props - Колбэк сохранения сессии и сеттер ошибки.
 * @returns Стадии авторизации, методы входа и управления модальным окном.
 */
export const useTwitchLogin = ({ onSuccess, setError }: UseTwitchLoginProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [authStage, setAuthStage] = useState<AuthStage>(TWITCH_AUTH_STAGES.IDLE)

  /**
   * Показывает ошибку авторизации в модальном окне.
   *
   * @param message - Текст ошибки.
   */
  const failAuth = useCallback((message: string): void => {
    setAuthStage(TWITCH_AUTH_STAGES.ERROR)
    setError(message)
    setIsModalOpen(true)
  }, [setError])

  /**
   * Проверяет токен и переводит авторизацию в финальную стадию.
   *
   * @param token - Токен доступа OAuth.
   */
  const authorizeToken = useCallback(async (token: string): Promise<void> => {
    setAuthStage(TWITCH_AUTH_STAGES.VALIDATING)
    setIsModalOpen(true)

    try {
      await onSuccess(token)
      setAuthStage(TWITCH_AUTH_STAGES.SUCCESS)
      setTimeout(() => setIsModalOpen(false), TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS)
    } catch (error) {
      failAuth(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.UNKNOWN_VALIDATION))
    }
  }, [failAuth, onSuccess])

  /**
   * Сохраняет `state` и перенаправляет текущую вкладку на страницу авторизации Twitch.
   */
  const login = useCallback((): void => {
    setError(null)
    setIsModalOpen(false)

    try {
      const { url, state } = createTwitchAuthRequest()

      if (!saveAuthAttempt(state)) {
        failAuth(TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_UNAVAILABLE)

        return
      }

      window.location.assign(url)
    } catch (error) {
      failAuth(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED))
    }
  }, [failAuth, setError])

  /**
   * Закрывает модальное окно авторизации.
   */
  const closeModal = useCallback((): void => {
    setIsModalOpen(false)
    setAuthStage(TWITCH_AUTH_STAGES.IDLE)
  }, [])

  return {
    isModalOpen,
    authStage,
    login,
    failAuth,
    closeModal,
    authorizeToken,
  }
}
