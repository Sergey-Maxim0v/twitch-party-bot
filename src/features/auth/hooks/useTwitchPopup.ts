import { useCallback, useEffect, useRef, useState } from 'react'
import { type AuthStage, TWITCH_AUTH_STAGES } from '../types'
import {
  AUTH_CONTEXT_TYPE,
  TWITCH_AUTH_BROADCAST_CHANNEL,
  TWITCH_AUTH_POPUP,
  TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS,
  TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS,
  TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS,
  TWITCH_AUTH_UI_MESSAGES,
  TWITCH_SESSION_ERRORS,
} from '../../../constants/auth.constants.ts'
import { createTwitchAuthRequest } from '../utils/getTwitchAuthUrl.ts'
import { clearAuthAttempt } from '../utils/clearAuthAttempt.ts'
import { getPopupBlockedMessage } from '../utils/getPopupBlockedMessage.ts'
import { isAuthAttemptValid } from '../utils/isAuthAttemptValid.ts'
import { isTwitchAuthMessage } from '../utils/isTwitchAuthMessage.ts'
import { saveAuthAttempt } from '../utils/saveAuthAttempt.ts'
import { isWebStorageAvailable } from '../../../hooks/utils/webStorage.utils.ts'
import { formatAuthError, getAuthErrorMessage } from '../utils/formatAuthError.ts'

interface UseTwitchPopupProps {
  onSuccess: (token: string) => Promise<void>;
  setError: (err: string | null) => void;
}

/**
 * Управляет авторизацией Twitch: всплывающим окном, приёмом результата и стадиями.
 *
 * @param props - Колбэк успешного получения токена и сеттер ошибки.
 * @returns Состояние модального окна, стадия авторизации и методы управления.
 */
export const useTwitchPopup = ({ onSuccess, setError }: UseTwitchPopupProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [authStage, setAuthStage] = useState<AuthStage>(TWITCH_AUTH_STAGES.IDLE)

  const popupRef = useRef<Window | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const canLoginInCurrentTab = isWebStorageAvailable('sessionStorage')

  /**
   * Закрывает канал приёма результата авторизации.
   */
  const closeAuthChannel = useCallback((): void => {
    channelRef.current?.close()
    channelRef.current = null
  }, [])

  /**
   * Закрывает popup, канал и сбрасывает сохранённую попытку входа.
   */
  const closePopup = useCallback((): void => {
    const popup = popupRef.current

    popupRef.current = null
    closeAuthChannel()
    clearAuthAttempt()

    if (popup && !popup.closed) popup.close()
  }, [closeAuthChannel])

  /**
   * Завершает попытку входа ошибкой и сбрасывает ожидание результата.
   *
   * @param message - Текст ошибки для модального окна.
   */
  const failAuth = useCallback((message: string): void => {
    closePopup()
    setAuthStage(TWITCH_AUTH_STAGES.ERROR)
    setError(message)
    setIsModalOpen(true)
  }, [closePopup, setError])

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
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.UNKNOWN_VALIDATION))
    }
  }, [onSuccess, setError])

  /**
   * Открывает канал приёма результата из popup и передаёт токен на проверку.
   *
   * Канал общий для всего источника, поэтому результат принимается только
   * с `state` сохранённой попытки входа.
   */
  const openAuthChannel = useCallback((): void => {
    closeAuthChannel()

    const channel = new BroadcastChannel(TWITCH_AUTH_BROADCAST_CHANNEL)
    channelRef.current = channel

    channel.onmessage = async (event: MessageEvent): Promise<void> => {
      const data: unknown = event.data

      if (!isTwitchAuthMessage(data)) return

      if (!isAuthAttemptValid(data.state)) {
        console.warn(TWITCH_SESSION_ERRORS.AUTH_MESSAGE_REJECTED)
        return
      }

      closeAuthChannel()
      clearAuthAttempt()

      if (data.error) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(formatAuthError(data.error))
        return
      }

      if (data.token) await authorizeToken(data.token)
    }
  }, [authorizeToken, closeAuthChannel, setError])

  /**
   * Открывает popup-окно авторизации Twitch.
   */
  const login = useCallback((): void => {
    setError(null)
    closePopup()

    try {
      const { url, state } = createTwitchAuthRequest()
      const { WIDTH: width, HEIGHT: height, NAME, FEATURES } = TWITCH_AUTH_POPUP
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      if (!saveAuthAttempt(state, AUTH_CONTEXT_TYPE.POPUP)) {
        failAuth(TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_UNAVAILABLE)
        return
      }

      openAuthChannel()

      const popup = window.open(url, NAME, `width=${width},height=${height},top=${top},left=${left},${FEATURES}`)

      if (!popup) {
        failAuth(getPopupBlockedMessage(canLoginInCurrentTab))
        return
      }

      popupRef.current = popup
      setAuthStage(TWITCH_AUTH_STAGES.WAITING)
      setIsModalOpen(true)
    } catch (error) {
      console.error(TWITCH_SESSION_ERRORS.AUTH_URL_FAILED, error)
      failAuth(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED))
    }
  }, [canLoginInCurrentTab, closePopup, failAuth, openAuthChannel, setError])

  /**
   * Запускает авторизацию в текущей вкладке — запасной путь при заблокированном popup.
   */
  const loginInCurrentTab = useCallback((): void => {
    setError(null)
    closePopup()

    try {
      const { url, state } = createTwitchAuthRequest()

      if (!saveAuthAttempt(state, AUTH_CONTEXT_TYPE.TAB)) {
        failAuth(TWITCH_AUTH_UI_MESSAGES.CURRENT_TAB_LOGIN_UNAVAILABLE)
        return
      }

      window.location.assign(url)
    } catch (error) {
      console.error(TWITCH_SESSION_ERRORS.AUTH_URL_FAILED, error)
      failAuth(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED))
    }
  }, [closePopup, failAuth, setError])

  /**
   * Закрывает модальное окно авторизации.
   */
  const closeModal = useCallback((): void => {
    setIsModalOpen(false)
    closePopup()
  }, [closePopup])

  useEffect(() => () => closeAuthChannel(), [closeAuthChannel])

  useEffect(() => {
    if (!isModalOpen || authStage !== TWITCH_AUTH_STAGES.WAITING) return

    const pollTimer = setInterval(() => {
      const popup = popupRef.current

      if (popup && !popup.closed) return

      failAuth(popup ? TWITCH_AUTH_UI_MESSAGES.POPUP_CLOSED : getPopupBlockedMessage(canLoginInCurrentTab))
    }, TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS)

    const timeoutTimer = setTimeout(() => {
      failAuth(TWITCH_AUTH_UI_MESSAGES.POPUP_TIMEOUT)
    }, TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS)

    return () => {
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  }, [canLoginInCurrentTab, failAuth, isModalOpen, authStage])

  return {
    isModalOpen,
    setIsModalOpen,
    authStage,
    setAuthStage,
    canLoginInCurrentTab,
    login,
    loginInCurrentTab,
    closeModal,
    authorizeToken,
  }
}
