import { useCallback, useEffect, useRef, useState } from 'react'
import type { TwitchAuthMessageData } from '../types/messages.types.ts'
import { TWITCH_AUTH_ERRORS } from '../../../constants/auth.constants.ts'
import { TWITCH_AUTH_STAGES, type AuthStage } from '../types'
import { getTwitchAuthUrl } from '../utils/getTwitchAuthUrl.ts'

interface UseTwitchPopupProps {
  onSuccess: (token: string) => Promise<void>;
  setError: (err: string | null) => void;
}

/**
 * Управляет всплывающим окном (popup) авторизации Twitch и стадиями процесса.
 *
 * @param props - Колбэк успешного получения токена и сеттер ошибки.
 * @returns Состояние модального окна, текущая стадия и методы управления popup.
 */
export const useTwitchPopup = ({ onSuccess, setError }: UseTwitchPopupProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [authStage, setAuthStage] = useState<AuthStage>(TWITCH_AUTH_STAGES.IDLE)

  const popupRef = useRef<Window | null>(null)

  /**
   * Инициализирует процесс авторизации и открывает всплывающее окно.
   */
  const login = useCallback((): void => {
    setError(null)

    try {
      const url = getTwitchAuthUrl()

      setAuthStage(TWITCH_AUTH_STAGES.WAITING)
      setIsModalOpen(true)

      const width = 500
      const height = 650
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      popupRef.current = window.open(
        url,
        'TwitchAuthPopup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      )
    } catch (err) {
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при формировании URL авторизации.'
      setError(errorMessage)
    }
  }, [setError])

  /**
   * Закрывает модальное и всплывающее окна.
   */
  const closeModal = useCallback((): void => {
    setIsModalOpen(false)
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
  }, [])

  /**
   * Обрабатывает результат авторизации, присланный всплывающим окном.
   */
  useEffect(() => {
    const handleMessage = async (event: MessageEvent): Promise<void> => {
      if (event.origin !== window.location.origin) return

      const data = event.data as Partial<TwitchAuthMessageData>
      if (!data || data.type !== 'TWITCH_AUTH_RESULT') return

      if (data.error) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        setError(
          data.error === TWITCH_AUTH_ERRORS.CSRF_FAILED
            ? 'Ошибка безопасности (CSRF): верификация контекста не пройдена.'
            : `Авторизация отклонена Twitch: ${data.error}`,
        )
        return
      }

      if (!data.token) return

      setAuthStage(TWITCH_AUTH_STAGES.VALIDATING)

      try {
        await onSuccess(data.token)
        setAuthStage(TWITCH_AUTH_STAGES.SUCCESS)

        setTimeout(() => {
          setIsModalOpen(false)
        }, 1000)
      } catch (err) {
        setAuthStage(TWITCH_AUTH_STAGES.ERROR)
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка валидации токена.'
        setError(errorMessage)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [onSuccess, setError])

  /**
   * Отслеживает ручное закрытие всплывающего окна пользователем.
   */
  useEffect(() => {
    if (!isModalOpen || authStage !== TWITCH_AUTH_STAGES.WAITING) return

    const timer = setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) return

      clearInterval(timer)
      setAuthStage(TWITCH_AUTH_STAGES.ERROR)
      setError('Авторизация отменена: всплывающее окно было закрыто.')
    }, 500)

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
