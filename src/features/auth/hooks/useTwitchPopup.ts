import { useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { TWITCH_AUTH_STAGES, type AuthStage } from '../types'
import {
  TWITCH_AUTH_MESSAGE_TYPE,
  TWITCH_AUTH_POPUP,
  TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS,
  TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS,
  TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS,
  TWITCH_AUTH_UI_MESSAGES,
} from '../../../constants/auth.constants.ts'
import { getTwitchAuthUrl } from '../utils/getTwitchAuthUrl.ts'
import { formatAuthError } from '../utils/formatAuthError.ts'

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

  /**
   * Закрывает всплывающее окно, если оно ещё открыто.
   */
  const closePopup = useCallback((): void => {
    if (!popupRef.current || popupRef.current.closed) return

    popupRef.current.close()
    popupRef.current = null
  }, [])

  /**
   * Открывает popup-окно авторизации Twitch.
   */
  const login = useCallback((): void => {
    setError(null)
    closePopup()

    try {
      const url = getTwitchAuthUrl()
      const { WIDTH: width, HEIGHT: height, NAME, FEATURES } = TWITCH_AUTH_POPUP
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(url, NAME, `width=${width},height=${height},top=${top},left=${left},${FEATURES}`)

      if (!popup) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED)
        setIsModalOpen(true)
        return
      }

      popupRef.current = popup
      setAuthStage(TWITCH_AUTH_STAGES.WAITING)
      setIsModalOpen(true)
    } catch (err) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(err instanceof Error ? err.message : TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED)
      setIsModalOpen(true)
    }
  }, [closePopup, setError])

  /**
   * Запускает авторизацию в текущей вкладке — запасной путь при заблокированном popup.
   */
  const loginInCurrentTab = useCallback((): void => {
    setError(null)
    closePopup()

    try {
      window.location.assign(getTwitchAuthUrl())
    } catch (err) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(err instanceof Error ? err.message : TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED)
      setIsModalOpen(true)
    }
  }, [closePopup, setError])

  /**
   * Закрывает модальное окно авторизации.
   */
  const closeModal = useCallback((): void => {
    setIsModalOpen(false)
    closePopup()
  }, [closePopup])

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
    } catch (err) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(err instanceof Error ? err.message : TWITCH_AUTH_UI_MESSAGES.UNKNOWN_VALIDATION)
    }
  }, [onSuccess, setError])

  useEffect(() => {
    const handleMessage = async (event: MessageEvent): Promise<void> => {
      if (event.origin !== window.location.origin || event.source !== popupRef.current) return

      const data = event.data as Partial<TwitchAuthMessageData>
      if (!data || data.type !== TWITCH_AUTH_MESSAGE_TYPE) return

      if (data.error) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(formatAuthError(data.error))
        return
      }

      if (!data.token) return

      await authorizeToken(data.token)
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [authorizeToken, setError])

  useEffect(() => {
    if (!isModalOpen || authStage !== TWITCH_AUTH_STAGES.WAITING) return

    const pollTimer = setInterval(() => {
      const popup = popupRef.current

      if (popup && !popup.closed) return

      clearInterval(pollTimer)
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(popup ? TWITCH_AUTH_UI_MESSAGES.POPUP_CLOSED : TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED)
    }, TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS)

    const timeoutTimer = setTimeout(() => {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(TWITCH_AUTH_UI_MESSAGES.POPUP_TIMEOUT)
    }, TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS)

    return () => {
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  }, [isModalOpen, authStage, setError])

  return {
    isModalOpen,
    setIsModalOpen,
    authStage,
    setAuthStage,
    login,
    loginInCurrentTab,
    closeModal,
    authorizeToken,
  }
}
