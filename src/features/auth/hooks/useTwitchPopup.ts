import { useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { TWITCH_AUTH_STAGES, type AuthStage } from '../types'
import {
  TWITCH_AUTH_ERRORS,
  TWITCH_AUTH_MESSAGE_TYPE,
  TWITCH_AUTH_POPUP,
  TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS,
  TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS,
  TWITCH_AUTH_UI_MESSAGES,
} from '../../../constants/auth.constants.ts'
import { getTwitchAuthUrl } from '../utils/getTwitchAuthUrl.ts'

interface UseTwitchPopupProps {
  onSuccess: (token: string) => Promise<void>;
  setError: (err: string | null) => void;
}

/**
 * Управляет popup-авторизацией Twitch и её стадиями.
 *
 * @param props - Колбэк успешного получения токена и сеттер ошибки.
 * @returns Состояние модального окна, стадия авторизации и методы управления.
 */
export const useTwitchPopup = ({ onSuccess, setError }: UseTwitchPopupProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [authStage, setAuthStage] = useState<AuthStage>(TWITCH_AUTH_STAGES.IDLE)

  const popupRef = useRef<Window | null>(null)

  /**
   * Открывает popup-окно авторизации Twitch.
   */
  const login = useCallback((): void => {
    setError(null)

    try {
      const url = getTwitchAuthUrl()
      const { WIDTH: width, HEIGHT: height, NAME, FEATURES } = TWITCH_AUTH_POPUP
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      setAuthStage(TWITCH_AUTH_STAGES.WAITING)
      setIsModalOpen(true)

      popupRef.current = window.open(
        url,
        NAME,
        `width=${width},height=${height},top=${top},left=${left},${FEATURES}`,
      )
    } catch (err) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(err instanceof Error ? err.message : TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED)
    }
  }, [setError])

  /**
   * Закрывает модальное и всплывающее окна.
   */
  const closeModal = useCallback((): void => {
    setIsModalOpen(false)

    if (!popupRef.current || popupRef.current.closed) return

    popupRef.current.close()
  }, [])

  useEffect(() => {
    const handleMessage = async (event: MessageEvent): Promise<void> => {
      if (event.origin !== window.location.origin || event.source !== popupRef.current) return

      const data = event.data as Partial<TwitchAuthMessageData>
      if (!data || data.type !== TWITCH_AUTH_MESSAGE_TYPE) return

      if (data.error) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(
          data.error === TWITCH_AUTH_ERRORS.CSRF_FAILED
            ? TWITCH_AUTH_UI_MESSAGES.CSRF_FAILED
            : `${TWITCH_AUTH_UI_MESSAGES.DENIED} ${data.error}`,
        )
        return
      }

      if (!data.token) return

      setAuthStage(TWITCH_AUTH_STAGES.VALIDATING)

      try {
        await onSuccess(data.token)
        setAuthStage(TWITCH_AUTH_STAGES.SUCCESS)
        setTimeout(() => setIsModalOpen(false), TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS)
      } catch (err) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(err instanceof Error ? err.message : TWITCH_AUTH_UI_MESSAGES.UNKNOWN_VALIDATION)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onSuccess, setError])

  useEffect(() => {
    if (!isModalOpen || authStage !== TWITCH_AUTH_STAGES.WAITING) return

    const timer = setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) return

      clearInterval(timer)
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(TWITCH_AUTH_UI_MESSAGES.POPUP_CLOSED)
    }, TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS)

    return () => {
      clearInterval(timer)
    }
  }, [isModalOpen, authStage, setError])

  return {
    isModalOpen,
    setIsModalOpen,
    authStage,
    setAuthStage,
    login,
    closeModal,
  }
}
