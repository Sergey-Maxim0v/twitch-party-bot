import { useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { type AuthStage, TWITCH_AUTH_STAGES } from '../types'
import {
  AUTH_CONTEXT_TYPE,
  TWITCH_AUTH_BROADCAST_CHANNEL,
  TWITCH_AUTH_MESSAGE_TYPE,
  TWITCH_AUTH_POPUP,
  TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS,
  TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS,
  TWITCH_AUTH_SUCCESS_CLOSE_DELAY_MS,
  TWITCH_AUTH_UI_MESSAGES,
  TWITCH_SESSION_ERRORS,
} from '../../../constants/auth.constants.ts'
import { createTwitchAuthRequest } from '../utils/getTwitchAuthUrl.ts'
import { saveAuthAttempt } from '../utils/crypto.ts'
import { isWebStorageAvailable } from '../../../hooks/utils/webStorage.utils.ts'
import { formatAuthError, getAuthErrorMessage } from '../utils/formatAuthError.ts'

interface UseTwitchPopupProps {
  onSuccess: (token: string) => Promise<void>;
  setError: (err: string | null) => void;
}

/**
 * Выбирает текст ошибки блокировки popup с учётом доступности запасного входа.
 *
 * @param canFallback - Доступен ли вход в текущей вкладке.
 * @returns Текст ошибки для модального окна.
 */
const getPopupBlockedMessage = (canFallback: boolean): string => (
  canFallback
    ? TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED
    : TWITCH_AUTH_UI_MESSAGES.POPUP_BLOCKED_WITHOUT_FALLBACK
)

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
   * Закрывает всплывающее окно, BroadcastChannel и сбрасывает ожидающий `state`.
   */
  const closePopup = useCallback((): void => {
    const popup = popupRef.current

    popupRef.current = null

    channelRef.current?.close()
    channelRef.current = null

    if (!popup || popup.closed) return

    popup.close()
  }, [])

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
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(TWITCH_AUTH_UI_MESSAGES.AUTH_STATE_UNAVAILABLE)
        setIsModalOpen(true)
        return
      }

      const popup = window.open(url, NAME, `width=${width},height=${height},top=${top},left=${left},${FEATURES}`)

      if (!popup) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(getPopupBlockedMessage(canLoginInCurrentTab))
        setIsModalOpen(true)
        return
      }

      popupRef.current = popup
      setAuthStage(TWITCH_AUTH_STAGES.WAITING)
      setIsModalOpen(true)
    } catch (error) {
      console.error(TWITCH_SESSION_ERRORS.AUTH_URL_FAILED, error)
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED))
      setIsModalOpen(true)
    }
  }, [canLoginInCurrentTab, closePopup, setError])

  /**
   * Запускает авторизацию в текущей вкладке — запасной путь при заблокированном popup.
   */
  const loginInCurrentTab = useCallback((): void => {
    setError(null)
    closePopup()

    try {
      const { url, state } = createTwitchAuthRequest()

      if (!saveAuthAttempt(state, AUTH_CONTEXT_TYPE.TAB)) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(TWITCH_AUTH_UI_MESSAGES.CURRENT_TAB_LOGIN_UNAVAILABLE)
        setIsModalOpen(true)
        return
      }

      window.location.assign(url)
    } catch (error) {
      console.error(TWITCH_SESSION_ERRORS.AUTH_URL_FAILED, error)
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.URL_BUILD_FAILED))
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
    } catch (error) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(getAuthErrorMessage(error, TWITCH_AUTH_UI_MESSAGES.UNKNOWN_VALIDATION))
    }
  }, [onSuccess, setError])

  useEffect(() => {
    const channel = new BroadcastChannel(TWITCH_AUTH_BROADCAST_CHANNEL)
    channelRef.current = channel

    channel.onmessage = async (event: MessageEvent): Promise<void> => {
      if (authStage !== TWITCH_AUTH_STAGES.WAITING) return

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

    return () => {
      channel.onmessage = null
      channel.close()
      channelRef.current = null
    }
  }, [authStage, authorizeToken, setError])

  useEffect(() => {
    if (!isModalOpen || authStage !== TWITCH_AUTH_STAGES.WAITING) return

    const pollTimer = setInterval(() => {
      const popup = popupRef.current

      if (popup && !popup.closed) return

      clearInterval(pollTimer)

      if (authStage !== TWITCH_AUTH_STAGES.WAITING) return

      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(popup ? TWITCH_AUTH_UI_MESSAGES.POPUP_CLOSED : getPopupBlockedMessage(canLoginInCurrentTab))
    }, TWITCH_AUTH_POPUP_CLOSE_POLL_INTERVAL_MS)

    const timeoutTimer = setTimeout(() => {
      if (authStage !== TWITCH_AUTH_STAGES.WAITING) return

      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError(TWITCH_AUTH_UI_MESSAGES.POPUP_TIMEOUT)
    }, TWITCH_AUTH_POPUP_WAIT_TIMEOUT_MS)

    return () => {
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  }, [canLoginInCurrentTab, isModalOpen, authStage, setError])

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
